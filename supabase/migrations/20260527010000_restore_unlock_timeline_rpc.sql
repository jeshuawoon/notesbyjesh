alter table public.events add column if not exists event_date date;

update public.events
set event_date = case
  when date_label ~ '^[A-Za-z]+ [0-9]{4}$' then to_date(date_label, 'FMMonth YYYY')
  else make_date(year, 1, 1)
end
where event_date is null;

alter table public.events alter column event_date set not null;

create index if not exists events_event_date_idx on public.events(event_date desc);

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

notify pgrst, 'reload schema';
