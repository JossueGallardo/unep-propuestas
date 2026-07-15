begin;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('admin');
create type public.community_role as enum ('estudiante', 'docente', 'familia', 'personal', 'otro');
create type public.proposal_category as enum (
  'academico',
  'infraestructura_espacios',
  'convivencia_bienestar',
  'cultura_eventos',
  'deportes_recreacion',
  'tecnologia',
  'medio_ambiente',
  'seguridad',
  'otra'
);
create type public.proposal_status as enum ('nueva', 'revisada', 'archivada');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  reference_code varchar(17) not null unique
    check (reference_code ~ '^UNEP-[A-F0-9]{12}$'),
  is_anonymous boolean not null,
  submitter_name varchar(100),
  community_role public.community_role,
  course_or_area varchar(80),
  category public.proposal_category not null,
  custom_category varchar(60),
  title varchar(140) not null check (char_length(title) between 5 and 140),
  description varchar(4000) not null check (char_length(description) between 20 and 4000),
  expected_benefit varchar(1200),
  status public.proposal_status not null default 'nueva',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  archived_at timestamptz,
  search_document tsvector generated always as (
    to_tsvector(
      'spanish'::regconfig,
      coalesce(reference_code, '') || ' ' ||
      coalesce(submitter_name, '') || ' ' ||
      coalesce(course_or_area, '') || ' ' ||
      coalesce(custom_category, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(expected_benefit, '')
    )
  ) stored,
  constraint proposals_anonymous_name check (not is_anonymous or submitter_name is null),
  constraint proposals_custom_category check (
    (category = 'otra' and custom_category is not null and char_length(custom_category) between 2 and 60)
    or (category <> 'otra' and custom_category is null)
  ),
  constraint proposals_expected_benefit_length check (
    expected_benefit is null or char_length(expected_benefit) between 1 and 1200
  ),
  constraint proposals_timestamps_match_status check (
    (status = 'nueva' and reviewed_at is null and archived_at is null)
    or (status = 'revisada' and reviewed_at is not null and archived_at is null)
    or (status = 'archivada' and archived_at is not null)
  )
);

create index proposals_created_at_idx on public.proposals (created_at desc);
create index proposals_status_created_at_idx on public.proposals (status, created_at desc);
create index proposals_category_created_at_idx on public.proposals (category, created_at desc);
create index proposals_anonymous_created_at_idx on public.proposals (is_anonymous, created_at desc);
create index proposals_search_document_idx on public.proposals using gin (search_document);

create table private.rpc_secret_verifiers (
  environment text primary key check (environment in ('preview', 'production')),
  secret_hash char(64) not null unique check (secret_hash ~ '^[a-f0-9]{64}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table private.submission_rate_limits (
  identifier_hash char(64) not null check (identifier_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  request_count smallint not null check (request_count between 1 and 3),
  primary key (identifier_hash, window_start)
);
create index submission_rate_limits_window_idx on private.submission_rate_limits (window_start);

create function private.clean_single_line(value text, maximum_length integer)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  cleaned text;
begin
  cleaned := nullif(btrim(regexp_replace(coalesce(value, ''), '[[:space:]]+', ' ', 'g')), '');
  if cleaned is not null and char_length(cleaned) > maximum_length then
    raise exception 'UNEP_INVALID_INPUT' using errcode = '22023';
  end if;
  return cleaned;
end;
$$;

create function private.clean_multiline(value text, maximum_length integer)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  cleaned text;
begin
  cleaned := replace(replace(coalesce(value, ''), chr(13) || chr(10), chr(10)), chr(13), chr(10));
  cleaned := regexp_replace(cleaned, '[[:blank:]]+', ' ', 'g');
  cleaned := regexp_replace(cleaned, '(' || chr(10) || '){3,}', chr(10) || chr(10), 'g');
  cleaned := nullif(btrim(cleaned), '');
  if cleaned is not null and char_length(cleaned) > maximum_length then
    raise exception 'UNEP_INVALID_INPUT' using errcode = '22023';
  end if;
  return cleaned;
end;
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create function private.protect_proposal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if row(
    new.id, new.reference_code, new.is_anonymous, new.submitter_name,
    new.community_role, new.course_or_area, new.category, new.custom_category,
    new.title, new.description, new.expected_benefit, new.created_at
  ) is distinct from row(
    old.id, old.reference_code, old.is_anonymous, old.submitter_name,
    old.community_role, old.course_or_area, old.category, old.custom_category,
    old.title, old.description, old.expected_benefit, old.created_at
  ) then
    raise exception 'UNEP_IMMUTABLE_CONTENT' using errcode = '22023';
  end if;

  if new.status = old.status then
    new.reviewed_at := old.reviewed_at;
    new.archived_at := old.archived_at;
    return new;
  end if;

  if old.status = 'nueva' and new.status = 'revisada' then
    new.reviewed_at := clock_timestamp();
    new.archived_at := null;
  elsif old.status in ('nueva', 'revisada') and new.status = 'archivada' then
    new.reviewed_at := old.reviewed_at;
    new.archived_at := clock_timestamp();
  else
    raise exception 'UNEP_INVALID_STATUS_TRANSITION' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger proposals_protect_update
before update on public.proposals
for each row execute function private.protect_proposal();

create function private.submit_proposal_internal(
  p_rpc_secret text,
  p_rate_limit_key text,
  p_is_anonymous boolean,
  p_submitter_name text,
  p_community_role public.community_role,
  p_course_or_area text,
  p_category public.proposal_category,
  p_custom_category text,
  p_title text,
  p_description text,
  p_expected_benefit text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_value timestamptz := clock_timestamp();
  current_window timestamptz;
  accepted_count smallint;
  normalized_name text;
  normalized_course text;
  normalized_custom_category text;
  normalized_title text;
  normalized_description text;
  normalized_benefit text;
  new_reference text;
begin
  if p_rpc_secret is null or not exists (
    select 1
    from private.rpc_secret_verifiers
    where active
      and secret_hash = encode(extensions.digest(p_rpc_secret, 'sha256'), 'hex')
  ) then
    raise exception 'UNEP_INVALID_SECRET' using errcode = '28000';
  end if;

  if p_rate_limit_key is null or p_rate_limit_key !~ '^[a-f0-9]{64}$' then
    raise exception 'UNEP_INVALID_INPUT' using errcode = '22023';
  end if;

  normalized_name := case when p_is_anonymous then null else private.clean_single_line(p_submitter_name, 100) end;
  normalized_course := private.clean_single_line(p_course_or_area, 80);
  normalized_custom_category := case when p_category = 'otra' then private.clean_single_line(p_custom_category, 60) else null end;
  normalized_title := private.clean_single_line(p_title, 140);
  normalized_description := private.clean_multiline(p_description, 4000);
  normalized_benefit := private.clean_multiline(p_expected_benefit, 1200);

  if p_is_anonymous is null
    or p_category is null
    or normalized_title is null
    or char_length(normalized_title) < 5
    or normalized_description is null
    or char_length(normalized_description) < 20
    or (p_category = 'otra' and (normalized_custom_category is null or char_length(normalized_custom_category) < 2)) then
    raise exception 'UNEP_INVALID_INPUT' using errcode = '22023';
  end if;

  delete from private.submission_rate_limits
  where window_start < now_value - interval '24 hours';

  current_window := date_bin(interval '15 minutes', now_value, timestamptz '2000-01-01 00:00:00+00');
  insert into private.submission_rate_limits (identifier_hash, window_start, request_count)
  values (p_rate_limit_key, current_window, 1)
  on conflict (identifier_hash, window_start) do update
    set request_count = private.submission_rate_limits.request_count + 1
    where private.submission_rate_limits.request_count < 3
  returning request_count into accepted_count;

  if accepted_count is null then
    raise exception 'UNEP_RATE_LIMIT' using errcode = 'P0001';
  end if;

  loop
    new_reference := 'UNEP-' || upper(encode(extensions.gen_random_bytes(6), 'hex'));
    begin
      insert into public.proposals (
        reference_code, is_anonymous, submitter_name, community_role,
        course_or_area, category, custom_category, title, description,
        expected_benefit
      ) values (
        new_reference, p_is_anonymous, normalized_name, p_community_role,
        normalized_course, p_category, normalized_custom_category,
        normalized_title, normalized_description, normalized_benefit
      );
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  return new_reference;
end;
$$;

create function public.submit_proposal(
  p_rpc_secret text,
  p_rate_limit_key text,
  p_is_anonymous boolean,
  p_submitter_name text,
  p_community_role public.community_role,
  p_course_or_area text,
  p_category public.proposal_category,
  p_custom_category text,
  p_title text,
  p_description text,
  p_expected_benefit text
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.submit_proposal_internal(
    p_rpc_secret,
    p_rate_limit_key,
    p_is_anonymous,
    p_submitter_name,
    p_community_role,
    p_course_or_area,
    p_category,
    p_custom_category,
    p_title,
    p_description,
    p_expected_benefit
  );
$$;

create function public.get_proposal_counts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'total', count(*),
    'nueva', count(*) filter (where status = 'nueva'),
    'revisada', count(*) filter (where status = 'revisada'),
    'archivada', count(*) filter (where status = 'archivada')
  )
  from public.proposals;
$$;

alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table private.rpc_secret_verifiers enable row level security;
alter table private.submission_rate_limits enable row level security;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy proposals_admin_select
on public.proposals
for select
to authenticated
using ((select private.is_admin()));

create policy proposals_admin_update
on public.proposals
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.proposals from public, anon, authenticated;
revoke all on table private.rpc_secret_verifiers from public, anon, authenticated;
revoke all on table private.submission_rate_limits from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant usage on schema private to anon, authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.proposals to authenticated;
grant update (status, reviewed_at, archived_at) on table public.proposals to authenticated;

revoke all on function private.clean_single_line(text, integer) from public, anon, authenticated;
revoke all on function private.clean_multiline(text, integer) from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.protect_proposal() from public, anon, authenticated;
revoke all on function private.submit_proposal_internal(
  text, text, boolean, text, public.community_role, text,
  public.proposal_category, text, text, text, text
) from public, anon, authenticated;
revoke all on function public.submit_proposal(
  text, text, boolean, text, public.community_role, text,
  public.proposal_category, text, text, text, text
) from public, anon, authenticated;
revoke all on function public.get_proposal_counts() from public, anon, authenticated;

grant execute on function private.submit_proposal_internal(
  text, text, boolean, text, public.community_role, text,
  public.proposal_category, text, text, text, text
) to anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function public.submit_proposal(
  text, text, boolean, text, public.community_role, text,
  public.proposal_category, text, text, text, text
) to anon;
grant execute on function public.get_proposal_counts() to authenticated;

alter default privileges for role postgres in schema public revoke execute on functions from public;
alter default privileges for role postgres in schema private revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema private revoke all on tables from anon, authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

comment on table public.proposals is 'Propuestas privadas recibidas por UNEP; su contenido original es inmutable.';
comment on function public.submit_proposal is 'Único punto de inserción público; exige el verificador secreto del servidor.';
comment on schema private is 'Objetos internos no expuestos por la Data API.';

commit;
