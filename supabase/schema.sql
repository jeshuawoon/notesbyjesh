create extension if not exists pgcrypto;

create table public.people (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  aliases text[] not null default '{}',
  code_display text not null unique,
  code_hash text not null unique,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  event_date date not null,
  year integer not null,
  date_label text not null,
  theme text not null check (theme in ('teal', 'gold', 'rose', 'violet', 'ember')),
  default_visible_from timestamptz,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  message text not null,
  verse_text text not null default '',
  verse_ref text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, event_id)
);

create index notes_person_id_idx on public.notes(person_id);
create index notes_event_id_idx on public.notes(event_id);
create index events_event_date_idx on public.events(event_date desc);

alter table public.people enable row level security;
alter table public.events enable row level security;
alter table public.notes enable row level security;

create or replace function public.unlock_timeline(input_code_hash text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'person', to_jsonb(p),
    'items', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'note', to_jsonb(n),
          'event', to_jsonb(e)
        )
        order by e.event_date desc, e.date_label desc
      ) filter (where n.id is not null and e.id is not null),
      '[]'::jsonb
    )
  )
  from public.people p
  left join public.notes n on n.person_id = p.id
  left join public.events e on e.id = n.event_id
  where p.code_hash = input_code_hash
  group by p.id;
$$;

revoke all on function public.unlock_timeline(text) from public;
grant execute on function public.unlock_timeline(text) to anon, authenticated;
