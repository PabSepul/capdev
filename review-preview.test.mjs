import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = (file) => fs.readFileSync(new URL(file, import.meta.url),'utf8');
const preview = read('review-preview.js');
const pages = fs.readdirSync(new URL('./', import.meta.url)).filter((name) => name.endsWith('.html')).map((name) => name.slice(0, -5));
function open(page, hostname, search, saved = new Map(), blocked = false) {
  const classes = new Set(['is-maintenance']);
  const metas = [];
  const root = {dataset:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
  const document = {documentElement:root, title:'Curso', createElement:()=>({}), head:{append:el=>metas.push(el)},
    querySelector(selector) { return selector.includes('robots') ? metas.find(m=>m.name==='robots') : {content:'Curso'}; }};
  const context = {document, URLSearchParams, window:{location:{hostname,search},matchMedia:()=>({matches:false})},
    localStorage:{getItem:()=>null}, sessionStorage:{
      getItem:key=>{if(blocked)throw Error();return saved.get(key);},
      setItem:(key,value)=>{if(blocked)throw Error();saved.set(key,value);},
      removeItem:key=>{if(blocked)throw Error();saved.delete(key);}
    }};
  const html = read(page+'.html');
  assert.match(html, /<html[^>]*class="is-maintenance"/, 'sin JavaScript se conserva mantenimiento');
  assert.match(html, /review-preview\.js\?v=20260912-brand1/);
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  vm.runInNewContext(preview,context);
  return {classes,root,metas};
}
for (const page of pages) {
  for (const host of ['intenta.cl','www.intenta.cl','capsulasdev.com','www.capsulasdev.com']) {
    assert.equal(open(page,host,'').classes.has('is-maintenance'),true);
    assert.equal(open(page,host,'?revision=incorrecta').classes.has('is-maintenance'),true);
    const saved = new Map();
    const reviewed = open(page,host,'?revision=septiembre-2026',saved);
    assert.equal(reviewed.classes.has('is-maintenance'),false);
    assert.equal(reviewed.root.dataset.review,'septiembre-2026');
    assert.equal(reviewed.metas[0].content,'noindex, nofollow');
    assert.equal(open(page,host,'',saved).classes.has('is-maintenance'),false);
    assert.equal(open(page,host,'?maintenance&revision=septiembre-2026',saved).classes.has('is-maintenance'),true);
    assert.equal(open(page,host,'',saved).classes.has('is-maintenance'),true);
    assert.equal(open(page,host,'?revision=septiembre-2026',new Map(),true).classes.has('is-maintenance'),false);
    assert.equal(open(page,host,'',new Map(),true).classes.has('is-maintenance'),true);
  }
  assert.equal(open(page,'localhost','').classes.has('is-maintenance'),false);
  assert.equal(open(page,'localhost','?maintenance').classes.has('is-maintenance'),true);
}
console.log(`Mantenimiento: ${pages.length} páginas, ambos dominios, entrada/salida de revisión, sesión, enlace erróneo, guardado bloqueado y noindex: OK`);
