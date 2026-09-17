import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
const require=createRequire(import.meta.url);
const modules=process.env.ACCOUNT_QA_MODULES || path.join(os.tmpdir(),'capsulasdev-account-qa','node_modules');
const {PGlite}=require(path.join(modules,'@electric-sql/pglite'));
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
class Storage {
  values=new Map(); get length(){return this.values.size;} key(i){return [...this.values.keys()][i];}
  getItem(k){return this.values.get(k)??null;} setItem(k,v){this.values.set(k,String(v));} removeItem(k){this.values.delete(k);}
}
const storage=new Storage();
const context=vm.createContext({localStorage:storage});
vm.runInContext(read('learning-state.js'),context);
vm.runInContext(read('learning-sync.js'),context);
const {LearningState:state,LearningSync:sync}=context;
const a=randomUUID(),b=randomUUID();
state.completar('python',1);state.save('python',0,'invitado');
state.usarCuenta(a);assert.equal(state.resumen().modulos,0);state.completar('sql',0);
state.usarCuenta(b);assert.equal(state.resumen().modulos,0);assert.equal(state.session('python').drafts[0],undefined);
state.usarCuenta(a);assert.equal(state.resumen().modulos,1);
state.usarCuenta(null);assert.equal(state.session('python').drafts[0],'invitado');
const qa=sync.create({storage,uuid:randomUUID,owner:a}),qb=sync.create({storage,uuid:randomUUID,owner:b});
qa.enqueue({kind:'draft',route:'python',module:0,code:'primero'});
const sent=qa.entries();qa.enqueue({kind:'draft',route:'python',module:0,code:'segundo'});
qa.acknowledge(sent,[sent[0].op.id]);assert.equal(qa.entries()[0].op.code,'segundo');assert.equal(qb.entries().length,0);
const otherTab=sync.create({storage,uuid:randomUUID,owner:a});otherTab.enqueue({kind:'draft',route:'python',module:0,code:'otra pestaña'});
assert.equal(qa.entries().length,2,'dos pestañas no sobrescriben sus cambios pendientes');
for(let i=0;i<450;i++)qa.enqueue({kind:'attempt',route:'python',module:0});
assert.equal(qa.entries().length,452,'la cola no rota los intentos sin confirmación');
const blocked=sync.create({storage:{get length(){return 0;},setItem(){throw Error('quota');}},uuid:randomUUID,owner:a});
blocked.enqueue({kind:'complete',route:'sql',module:0});assert.equal(blocked.durable(),false);assert.equal(blocked.entries().length,1);

const db=new PGlite();
await db.exec(`create role anon; create role authenticated;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(read('supabase/migrations/202609070001_accounts.sql'));
await db.exec(read('supabase/migrations/202609150001_weekly_learning_plan.sql'));
await db.exec(read('supabase/migrations/202609150002_weekly_sessions.sql'));
await db.exec(read('supabase/migrations/202609160001_python_advanced.sql'));
await db.exec(read('supabase/migrations/202609160002_course_minimum_fifty.sql'));
await db.exec(read('supabase/migrations/202609160003_javascript_fifty.sql'));
await db.exec(read('supabase/migrations/202609160004_sql_fifty.sql'));
await db.exec(read('supabase/migrations/202609170001_git_fifty.sql'));
await db.query('insert into auth.users values ($1),($2)',[a,b]);
await db.exec('set role authenticated');
const asUser=async id=>db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
const rpc=async ops=>(await db.query('select public.learning_sync($1::jsonb) as result',[JSON.stringify(ops)])).rows[0].result;
const enroll=()=>db.query("select public.learning_enroll('Ada',true,'2026-09-07')");
await asUser(a);
await assert.rejects(rpc([]),/Completa tu perfil/);
await assert.rejects(db.query("select public.learning_enroll('Ada',false,'2026-09-07')"),/mayoría/);
await enroll();
const preference={id:randomUUID(),kind:'preference',itinerary:'python-datos'};
const weeklyPlan={id:randomUUID(),kind:'weekly-plan',pace:'steady',target:7,week:'2026-09-14',baseline:0};
const feedback={id:randomUUID(),kind:'feedback',route:'docker',module:0,value:'mejorar',area:'explicacion'};
const dockerComplete={id:randomUUID(),kind:'complete',route:'docker',module:0};
const mongoComplete={id:randomUUID(),kind:'complete',route:'mongodb',module:0};
let experience=await rpc([preference,weeklyPlan,feedback,dockerComplete,mongoComplete]);
assert.equal(experience.profile.itinerary,'python-datos');
assert.equal(experience.profile.weekly_pace,'steady');
assert.equal(experience.profile.weekly_target,7);
assert.equal(experience.profile.weekly_paused,false);
assert.equal(experience.routes.docker.feedback['0'].valor,'mejorar');
assert.deepEqual(experience.routes.docker.completados,[0]);
assert.deepEqual(experience.routes.mongodb.completados,[0]);
await assert.rejects(rpc([{id:randomUUID(),kind:'preference',itinerary:'inventado'}]),/Itinerario inválido/);
await assert.rejects(rpc([{...weeklyPlan,id:randomUUID(),target:20}]),/Plan semanal inválido/);
experience=await rpc([{...weeklyPlan,id:randomUUID(),paused:true}]);
assert.equal(experience.profile.weekly_paused,true);
await assert.rejects(rpc([{...weeklyPlan,id:randomUUID(),paused:'sí'}]),/Plan semanal inválido/);
await assert.rejects(rpc([{id:randomUUID(),kind:'feedback',route:'docker',module:0,value:'texto libre',area:'otro'}]),/Feedback inválido/);
const attempt={id:randomUUID(),kind:'attempt',route:'python',module:0,v:'101',ok:false,error:false,ms:1234};
const complete={id:randomUUID(),kind:'complete',route:'python',module:0};
let remote=await rpc([attempt,complete]);assert.deepEqual(remote.routes.python.completados,[1]);assert.equal(remote.routes.python.intentos['0'],1);
remote=await rpc([attempt,complete]);assert.equal(remote.routes.python.intentos['0'],1,'reintento HTTP no duplica intentos');
remote=await rpc([
  {id:randomUUID(),kind:'complete',route:'python',module:39},
  {id:randomUUID(),kind:'exam',route:'python',module:9}
]);
assert.deepEqual(remote.routes.python.completados,[1,40],'la cuenta sincroniza el proyecto 40');
assert.deepEqual(remote.routes.python.examenes,[10],'la cuenta sincroniza el examen del nivel 10');
remote=await rpc([
  {id:randomUUID(),kind:'complete',route:'python',module:49},
  {id:randomUUID(),kind:'exam',route:'python',module:12},
  {id:randomUUID(),kind:'complete',route:'html-css',module:49},
  {id:randomUUID(),kind:'exam',route:'html-css',module:12},
  {id:randomUUID(),kind:'complete',route:'javascript',module:49},
  {id:randomUUID(),kind:'exam',route:'javascript',module:12},
  {id:randomUUID(),kind:'complete',route:'sql',module:49},
  {id:randomUUID(),kind:'exam',route:'sql',module:12},
  {id:randomUUID(),kind:'complete',route:'git',module:49},
  {id:randomUUID(),kind:'exam',route:'git',module:12}
]);
assert.deepEqual(remote.routes.python.completados,[1,40,50],'la cuenta sincroniza el proyecto 50');
assert.deepEqual(remote.routes.python.examenes,[10,13],'la cuenta sincroniza el examen del nivel 13');
assert.deepEqual(remote.routes['html-css'].completados,[49],'HTML/CSS sincroniza el módulo 50');
assert.deepEqual(remote.routes['html-css'].examenes,[13],'HTML/CSS sincroniza el examen final');
assert.deepEqual(remote.routes.javascript.completados,[49],'JavaScript sincroniza el módulo 50');
assert.deepEqual(remote.routes.javascript.examenes,[13],'JavaScript sincroniza el examen final');
assert.deepEqual(remote.routes.sql.completados,[49],'SQL sincroniza el módulo 50');
assert.deepEqual(remote.routes.sql.examenes,[13],'SQL sincroniza el examen final');
assert.deepEqual(remote.routes.git.completados,[49],'Git sincroniza el módulo 50');
assert.deepEqual(remote.routes.git.examenes,[13],'Git sincroniza el examen final');
await assert.rejects(rpc([{id:randomUUID(),kind:'complete',route:'python',module:50}]),/Operación inválida/);
await assert.rejects(rpc([{id:randomUUID(),kind:'complete',route:'javascript',module:50}]),/Operación inválida/);
await assert.rejects(rpc([{id:randomUUID(),kind:'complete',route:'sql',module:50}]),/Operación inválida/);
await assert.rejects(rpc([{id:randomUUID(),kind:'complete',route:'git',module:50}]),/Operación inválida/);
await assert.rejects(rpc([{...attempt,ms:9}]),/identificador/);
await assert.rejects(rpc([{id:randomUUID(),kind:'complete',route:'python',module:1},{...attempt,id:randomUUID(),module:99}]),/Operación inválida/);
assert.deepEqual((await rpc([])).routes.python.completados,[1,40,50],'un lote inválido revierte todos sus cambios');
const draft={id:randomUUID(),kind:'draft',route:'python',module:0,code:'print(1)',base:null};
await rpc([draft]);
const updated={...draft,id:randomUUID(),code:'print(2)',base:draft.id};await rpc([updated]);
const conflict={...draft,id:randomUUID(),code:'print(3)',base:draft.id};remote=await rpc([conflict]);
assert.equal(remote.drafts[0].code,'print(2)');assert.equal(remote.conflicts[0].code,'print(3)');
remote=await rpc([{...conflict,id:randomUUID(),base:updated.id,resolve:conflict.id}]);
assert.equal(remote.drafts[0].code,'print(3)');assert.equal(remote.conflicts.length,0);
await rpc([{id:randomUUID(),kind:'baseline',route:'python',module:0,count:5}]);
remote=await rpc([{id:randomUUID(),kind:'baseline',route:'python',module:0,count:5}]);assert.equal(remote.routes.python.intentos['0'],5);
await assert.rejects(db.query("update public.learning_routes set state='{}'"),/permission denied/);
await asUser(b);await enroll();assert.deepEqual((await rpc([])).routes,{});
assert.equal((await db.query('select * from public.learning_operations')).rows.length,0,'RLS impide leer los intentos ajenos');
await rpc([{...complete,id:randomUUID(),module:3,user_id:a}]);
assert.deepEqual((await rpc([])).routes.python.completados,[4],'el propietario sale del token, no del cuerpo');
await asUser(a);assert.deepEqual((await rpc([])).routes.python.completados,[1,40,50]);
const exported=(await db.query('select public.learning_export() as data')).rows[0].data;
assert.equal(exported.operations.some(x=>x.operation.id===attempt.id),true);
await db.exec('reset role');await db.query('delete from auth.users where id=$1',[a]);
assert.equal((await db.query('select * from public.learning_operations where user_id=$1',[a])).rows.length,0,'borrar identidad elimina datos por cascada');
await db.exec('set role anon');await assert.rejects(rpc([]),/permission denied/);
await db.close();
console.log('Cuentas: aislamiento local, cola durable, dos pestañas, 450 intentos pendientes; PostgreSQL real, RLS, identidad, deduplicación, rollback, conflictos, exportación y borrado: OK');
