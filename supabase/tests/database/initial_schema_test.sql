begin;

do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.proposals'::regclass) then
    raise exception 'RLS no está activo en proposals';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass) then
    raise exception 'RLS no está activo en profiles';
  end if;
  if has_table_privilege('anon', 'public.proposals', 'select') then
    raise exception 'anon no debe poder leer proposals';
  end if;
  if has_table_privilege('anon', 'public.proposals', 'insert') then
    raise exception 'anon no debe poder insertar directamente en proposals';
  end if;
  if has_table_privilege('authenticated', 'public.proposals', 'delete') then
    raise exception 'authenticated no debe poder eliminar proposals';
  end if;
  if has_function_privilege('anon', 'public.rls_auto_enable()', 'execute') then
    raise exception 'anon no debe ejecutar rls_auto_enable';
  end if;
end;
$$;

insert into private.rpc_secret_verifiers (environment, secret_hash)
values ('preview', encode(extensions.digest('sql-test-secret', 'sha256'), 'hex'))
on conflict (environment) do update
set secret_hash = excluded.secret_hash, active = true;

set local role anon;

do $$
declare
  first_reference text;
  idx integer;
begin
  first_reference := public.submit_proposal(
    'sql-test-secret', repeat('a', 64), true, 'No debe guardarse', 'estudiante',
    'Tercero A', 'academico', null, 'Una propuesta válida',
    'Esta descripción contiene suficiente detalle para ser válida.', null
  );
  if first_reference !~ '^UNEP-[A-F0-9]{12}$' then
    raise exception 'El RPC devolvió una respuesta distinta de la referencia mínima';
  end if;

  for idx in 1..2 loop
    perform public.submit_proposal(
      'sql-test-secret', repeat('a', 64), true, null, 'estudiante', null,
      'academico', null, 'Otra propuesta válida',
      'Esta descripción también contiene suficiente detalle para ser válida.', null
    );
  end loop;

  begin
    perform public.submit_proposal(
      'sql-test-secret', repeat('a', 64), true, null, null, null,
      'academico', null, 'Cuarta propuesta válida',
      'Esta cuarta descripción contiene suficiente detalle para ser válida.', null
    );
    raise exception 'El cuarto envío debió ser limitado';
  exception when others then
    if sqlerrm not like '%UNEP_RATE_LIMIT%' then raise; end if;
  end;
end;
$$;

reset role;

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-000000000101', 'admin-sql-test@example.com'),
  ('00000000-0000-4000-8000-000000000102', 'regular-sql-test@example.com');
insert into public.profiles (id, role)
values ('00000000-0000-4000-8000-000000000101', 'admin');

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000102","role":"authenticated"}',
  true
);
set local role authenticated;
do $$
declare
  visible_count integer;
  changed_count integer;
begin
  select count(*) into visible_count from public.proposals;
  if visible_count <> 0 then
    raise exception 'Un usuario autenticado sin perfil admin pudo leer proposals';
  end if;
  update public.proposals set status = 'revisada';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then
    raise exception 'Un usuario autenticado sin perfil admin pudo actualizar proposals';
  end if;
end;
$$;
reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000101","role":"authenticated"}',
  true
);
set local role authenticated;
do $$
declare
  visible_count integer;
  changed_count integer;
begin
  select count(*) into visible_count from public.proposals;
  if visible_count <> 3 then
    raise exception 'El administrador no puede leer todas las proposals de prueba';
  end if;
  update public.proposals
  set status = 'revisada'
  where id = (select id from public.proposals where status = 'nueva' limit 1);
  get diagnostics changed_count = row_count;
  if changed_count <> 1 then
    raise exception 'El administrador no pudo actualizar status';
  end if;
  begin
    update public.proposals set title = 'Cambio no permitido';
    raise exception 'El administrador pudo actualizar contenido original';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;

do $$
declare
  proposal_id uuid;
begin
  if exists (select 1 from public.proposals where is_anonymous and submitter_name is not null) then
    raise exception 'El nombre de una propuesta anónima fue almacenado';
  end if;
  select id into proposal_id from public.proposals where status = 'nueva' limit 1;
  update public.proposals set status = 'revisada' where id = proposal_id;
  if not exists (select 1 from public.proposals where id = proposal_id and reviewed_at is not null) then
    raise exception 'La transición a revisada no estableció reviewed_at';
  end if;
  begin
    update public.proposals set title = 'Contenido alterado' where id = proposal_id;
    raise exception 'El contenido original debió ser inmutable';
  exception when others then
    if sqlerrm not like '%UNEP_IMMUTABLE_CONTENT%' then raise; end if;
  end;
  update public.proposals set status = 'archivada' where id = proposal_id;
  begin
    update public.proposals set status = 'revisada' where id = proposal_id;
    raise exception 'Archivada debe ser un estado terminal';
  exception when others then
    if sqlerrm not like '%UNEP_INVALID_STATUS_TRANSITION%' then raise; end if;
  end;
end;
$$;

rollback;
