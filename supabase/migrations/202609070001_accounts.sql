-- CápsulasDev: ejecutar una vez en un proyecto Supabase nuevo.
-- Las escrituras pasan por RPC: el cliente nunca elige el propietario.
begin;
create table public.learning_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alias text not null default '' check (char_length(alias) <= 60),
  privacy_version text not null,
  adult_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.learning_routes (
  user_id uuid references auth.users(id) on delete cascade,
  route text not null,
  state jsonb not null default '{"completados":[],"examenes":[],"intentos":{}}',
  primary key(user_id, route)
);
create table public.learning_operations (
  user_id uuid references auth.users(id) on delete cascade,
  id uuid not null,
  kind text not null,
  payload jsonb not null,
  received_at timestamptz not null default clock_timestamp(),
  primary key(user_id, id)
);
create table public.learning_drafts (
  user_id uuid references auth.users(id) on delete cascade,
  route text not null,
  module integer not null,
  version uuid not null,
  code text,
  primary key(user_id, route, module)
);
create table public.learning_draft_conflicts (
  user_id uuid references auth.users(id) on delete cascade,
  version uuid not null,
  route text not null,
  module integer not null,
  code text,
  created_at timestamptz not null default now(),
  primary key(user_id, version)
);
alter table public.learning_profiles enable row level security;
alter table public.learning_routes enable row level security;
alter table public.learning_operations enable row level security;
alter table public.learning_drafts enable row level security;
alter table public.learning_draft_conflicts enable row level security;
revoke all on public.learning_profiles, public.learning_routes, public.learning_operations,
  public.learning_drafts, public.learning_draft_conflicts from anon, authenticated;
grant select on public.learning_profiles, public.learning_routes, public.learning_operations,
  public.learning_drafts, public.learning_draft_conflicts to authenticated;
create policy own_profile on public.learning_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy own_routes on public.learning_routes for select to authenticated using (user_id = (select auth.uid()));
create policy own_operations on public.learning_operations for select to authenticated using (user_id = (select auth.uid()));
create policy own_drafts on public.learning_drafts for select to authenticated using (user_id = (select auth.uid()));
create policy own_conflicts on public.learning_draft_conflicts for select to authenticated using (user_id = (select auth.uid()));

create function public.learning_enroll(p_alias text, p_adult boolean, p_privacy text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sesión requerida'; end if;
  if p_adult is distinct from true or p_privacy is distinct from '2026-09-07' then
    raise exception 'Confirma la mayoría de edad y el aviso de privacidad';
  end if;
  insert into public.learning_profiles(user_id, alias, privacy_version)
  values (auth.uid(), trim(coalesce(p_alias,'')), p_privacy)
  on conflict(user_id) do update set alias = excluded.alias;
end $$;

create function public.learning_sync(p_operations jsonb default '[]')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); op jsonb; rid text; idx integer; n integer; offset_id integer;
  oid uuid; k text; s jsonb; current_draft public.learning_drafts;
  accepted jsonb := '[]'; found_draft boolean; duplicate boolean; result jsonb;
begin
  if uid is null then raise exception 'Sesión requerida'; end if;
  if not exists(select 1 from public.learning_profiles where user_id = uid) then
    raise exception 'Completa tu perfil antes de sincronizar';
  end if;
  if jsonb_typeof(p_operations) is distinct from 'array' or jsonb_array_length(p_operations) > 100
    or octet_length(p_operations::text) > 4000000 then raise exception 'Lote inválido'; end if;
  -- Serializa los cambios de una cuenta aunque procedan de dos dispositivos.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
  for op in select value from jsonb_array_elements(p_operations) loop
    oid := (op->>'id')::uuid; k := op->>'kind'; rid := op->>'route'; idx := (op->>'module')::integer;
    n := case when rid = 'python' then 20 when rid in ('html-css','javascript','sql','git','apis') then 16
      when rid in ('terminal','regex','ia','datos-python','nodejs','typescript','react','json','markdown','accesibilidad','testing') then 12 else 0 end;
    offset_id := case when rid = 'python' then 1 else 0 end;
    if oid is null or k is null or n = 0 or idx is null or idx < 0 or idx >= n
      or k not in ('complete','exam','attempt','draft','baseline') then raise exception 'Operación inválida'; end if;
    select exists(select 1 from public.learning_operations where user_id=uid and id=oid) into duplicate;
    if duplicate then
      if (select payload from public.learning_operations where user_id=uid and id=oid) <> op then
        raise exception 'El identificador ya pertenece a otro cambio';
      end if;
      accepted := accepted || jsonb_build_array(oid); continue;
    end if;
    insert into public.learning_routes(user_id,route) values(uid,rid) on conflict do nothing;
    select state into s from public.learning_routes where user_id=uid and route=rid;
    if k = 'complete' then
      s := jsonb_set(s,'{completados}',(select coalesce(jsonb_agg(v order by v),'[]') from
        (select distinct value::integer v from jsonb_array_elements_text((s->'completados') || jsonb_build_array(idx+offset_id))) a));
    elsif k = 'exam' then
      if idx >= n/4 then raise exception 'Examen inválido'; end if;
      s := jsonb_set(s,'{examenes}',(select coalesce(jsonb_agg(v order by v),'[]') from
        (select distinct value::integer v from jsonb_array_elements_text((s->'examenes') || jsonb_build_array(idx+1))) a));
    elsif k = 'attempt' then
      if coalesce(op->>'v','') !~ '^[01]{3}$' or jsonb_typeof(op->'ok') is distinct from 'boolean'
        or jsonb_typeof(op->'error') is distinct from 'boolean' or (op->>'ms')::numeric not between 0 and 3600000
        or op->>'ms' is null then raise exception 'Intento inválido'; end if;
      s := jsonb_set(s,array['intentos',idx::text],to_jsonb(coalesce((s->'intentos'->>idx::text)::integer,0)+1),true);
    elsif k = 'baseline' then
      -- Importaciones repetidas conservan el mayor contador: nunca suman una copia del mismo historial.
      if (op->>'count')::integer not between 0 and 99999 or op->>'count' is null then raise exception 'Contador inválido'; end if;
      s := jsonb_set(s,array['intentos',idx::text],to_jsonb(greatest(coalesce((s->'intentos'->>idx::text)::integer,0),(op->>'count')::integer)),true);
    elsif k = 'draft' then
      if char_length(op->>'code') > 30000 or (op->'code' is not null and jsonb_typeof(op->'code') not in ('string','null')) then
        raise exception 'Borrador inválido'; end if;
      select * into current_draft from public.learning_drafts where user_id=uid and route=rid and module=idx;
      found_draft := found;
      if not found_draft or current_draft.version::text = op->>'base' or current_draft.code is not distinct from op->>'code' then
        insert into public.learning_drafts(user_id,route,module,version,code) values(uid,rid,idx,oid,op->>'code')
        on conflict(user_id,route,module) do update set version=excluded.version,code=excluded.code;
      else
        insert into public.learning_draft_conflicts(user_id,version,route,module,code) values(uid,oid,rid,idx,op->>'code');
      end if;
      if op->>'resolve' is not null then
        delete from public.learning_draft_conflicts where user_id=uid and version=(op->>'resolve')::uuid
          and route=rid and module=idx and (not found_draft or current_draft.version::text = op->>'base');
      end if;
    end if;
    update public.learning_routes set state=s where user_id=uid and route=rid;
    insert into public.learning_operations(user_id,id,kind,payload) values(uid,oid,k,op);
    accepted := accepted || jsonb_build_array(oid);
  end loop;
  select jsonb_build_object(
    'accepted',accepted,
    'routes',coalesce((select jsonb_object_agg(route,state) from public.learning_routes where user_id=uid),'{}'),
    'drafts',coalesce((select jsonb_agg(to_jsonb(d)-'user_id') from public.learning_drafts d where user_id=uid),'[]'),
    'conflicts',coalesce((select jsonb_agg(to_jsonb(d)-'user_id') from public.learning_draft_conflicts d where user_id=uid),'[]'),
    'profile',(select to_jsonb(p)-'user_id' from public.learning_profiles p where user_id=uid)
  ) into result;
  return result;
end $$;

create function public.learning_export() returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sesión requerida'; end if;
  return jsonb_build_object('format','capsulasdev/account-v1','exported_at',now(),
    'state',public.learning_sync('[]'),
    'operations',coalesce((select jsonb_agg(jsonb_build_object('operation',payload,'received_at',received_at))
      from public.learning_operations where user_id=auth.uid()),'[]'));
end $$;
revoke all on function public.learning_enroll(text,boolean,text), public.learning_sync(jsonb), public.learning_export() from public, anon;
grant execute on function public.learning_enroll(text,boolean,text), public.learning_sync(jsonb), public.learning_export() to authenticated;
commit;
