# Personal Notes Site Design

## Goal

Build a personal notes site where a recipient enters a short permanent code and sees their full published note history. A local-only creator lets Jeshua search people, avoid duplicate people/codes, create events, write notes, and set future unlock times.

## Stack

- Next.js App Router with TypeScript and Tailwind CSS
- Supabase Postgres for production data
- Server-only Supabase access for unlock and editor mutations
- Local/mock data fallback until Supabase credentials are available
- Vercel hosting for the public reader

## Core Model

- People are permanent identities.
- Each person receives one permanent 5-character friendly code at creation.
- Events are camp/year chapters with a name, date label, year, and theme preset.
- Notes belong to a person and an event.
- A note may have a `visible_from` timestamp. Future notes appear as locked full-viewport countdown sections.
- Past and currently visible notes render in the public timeline.

## Public Reader

The root page shows a code input. Codes are normalized by uppercasing and removing spaces or hyphens. A valid code unlocks the matching person. The app renders that person's note timeline, showing visible notes normally and future notes as locked countdown sections.

The public reader does not list notes, people, or events. Pages should be marked `noindex`.

## Local Creator

The creator lives at `/studio` for now but is intended for local use. It provides:

- Person search by display name, aliases, and code
- Duplicate warning when creating a person
- Person creation with automatic code generation
- Person profile with permanent code
- Event creation/editing with theme preset and date label
- Existing note editing
- New note creation
- Optional visible-from release time
- Preview-oriented fields that map cleanly to the public timeline

## Note Content

V1 avoids a heavy rich text editor. Notes use:

- Main multiline text rendered as paragraphs
- Inline standout marker syntax: `[[STEADFAST]]`
- Separate Bible verse text and reference fields

The renderer turns standout markers into a designed inline emphasis span.

## Safety

- Supabase secret/service keys stay server-side only.
- The browser never receives broad database credentials.
- Public lookup returns only the matching person timeline.
- Codes are not high-security authentication; they are private links in short-code form.
- Future notes confirm that something is waiting without revealing the note body.

