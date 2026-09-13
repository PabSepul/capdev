begin;
alter table public.learning_profiles add column if not exists itinerary text;
alter table public.learning_profiles drop constraint if exists learning_profiles_itinerary_check;
alter table public.learning_profiles add constraint learning_profiles_itinerary_check check (itinerary is null or itinerary in ('web','python-datos','herramientas'));

create or replace function public.learning_sync(p_operations jsonb default '[]')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); op jsonb; rid text; idx integer; n integer; offset_id integer; selected_itinerary text;
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
    oid := (op->>'id')::uuid; k := op->>'kind';
    if oid is null or k is null then raise exception 'Operación inválida'; end if;
    select exists(select 1 from public.learning_operations where user_id=uid and id=oid) into duplicate;
    if duplicate then
      if (select payload from public.learning_operations where user_id=uid and id=oid) <> op then
        raise exception 'El identificador ya pertenece a otro cambio';
      end if;
      accepted := accepted || jsonb_build_array(oid); continue;
    end if;
    if k = 'preference' then
      selected_itinerary := case when op->'itinerary' = 'null'::jsonb then null else op->>'itinerary' end;
      if selected_itinerary is not null and selected_itinerary not in ('web','python-datos','herramientas') then
        raise exception 'Itinerario inválido';
      end if;
      update public.learning_profiles set itinerary=selected_itinerary where user_id=uid;
      insert into public.learning_operations(user_id,id,kind,payload) values(uid,oid,k,op);
      accepted := accepted || jsonb_build_array(oid); continue;
    end if;
    rid := op->>'route'; idx := (op->>'module')::integer;
    n := case when rid = 'python' then 20 when rid in ('html-css','javascript','sql','git','apis') then 16
      when rid in ('terminal','regex','ia','datos-python','nodejs','typescript','react','json','markdown','accesibilidad','testing','docker','mongodb') then 12 else 0 end;
    offset_id := case when rid = 'python' then 1 else 0 end;
    if oid is null or k is null or n = 0 or idx is null or idx < 0 or idx >= n
      or k not in ('complete','exam','attempt','draft','baseline','feedback') then raise exception 'Operación inválida'; end if;
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
    elsif k = 'feedback' then
      if op->>'value' not in ('claro','mejorar')
        or (op->>'area' is not null and op->>'area' not in ('explicacion','mision','resultado','pistas','otro')) then
        raise exception 'Feedback inválido';
      end if;
      s := jsonb_set(s,'{feedback}',coalesce(s->'feedback','{}'::jsonb),true);
      s := jsonb_set(s,array['feedback',idx::text],jsonb_build_object(
        'valor',op->>'value','area',op->>'area',
        'actualizado',(extract(epoch from pg_catalog.clock_timestamp())*1000)::bigint
      ),true);
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

revoke all on function public.learning_sync(jsonb) from public, anon;
grant execute on function public.learning_sync(jsonb) to authenticated;
commit;

