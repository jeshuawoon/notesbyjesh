# Personal Notes Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-ready personal notes reader and local creator for permanent person codes and note timelines.

**Architecture:** Next.js owns both the public reader and local creator. Data access goes through a repository layer with a mock implementation now and a Supabase implementation once credentials exist. UI components are split between public timeline rendering and studio editing flows.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase client, server actions/route handlers, mock seed data.

---

### Task 1: Scaffold App

**Files:**
- Create Next.js app in `/Users/jeshuawoon/git/byjesh`
- Modify generated `src/app/layout.tsx`
- Modify generated `src/app/globals.css`

- [ ] Run `npx create-next-app@latest . --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm`
- [ ] Install `@supabase/supabase-js`
- [ ] Add app metadata with `noindex`
- [ ] Replace starter page with project routes

### Task 2: Data Types And Mock Repository

**Files:**
- Create `src/lib/types.ts`
- Create `src/lib/code.ts`
- Create `src/lib/mock-data.ts`
- Create `src/lib/repository.ts`

- [ ] Define `Person`, `Event`, `Note`, and `TimelineItem` types
- [ ] Implement friendly code generation and normalization
- [ ] Add mock people/events/notes matching the sample
- [ ] Add repository functions for unlock, search, create person, upsert note, list events

### Task 3: Supabase Schema

**Files:**
- Create `supabase/schema.sql`
- Create `.env.example`
- Create `src/lib/supabase/server.ts`

- [ ] Define tables for people, events, and notes
- [ ] Add unique constraints for code and event slug
- [ ] Add indexes for person/note lookup
- [ ] Add lazy Supabase server client factory

### Task 4: Public Reader

**Files:**
- Modify `src/app/page.tsx`
- Create `src/app/actions.ts`
- Create `src/components/public/code-entry.tsx`
- Create `src/components/public/timeline.tsx`
- Create `src/components/public/countdown-section.tsx`
- Create `src/components/public/standout-text.tsx`

- [ ] Build code input with normalization and error state
- [ ] Unlock via server action
- [ ] Render visible notes and future countdown notes
- [ ] Render inline standout markers
- [ ] Match the dark, intimate visual direction from the prototype

### Task 5: Local Studio

**Files:**
- Create `src/app/studio/page.tsx`
- Create `src/components/studio/studio-shell.tsx`
- Create `src/components/studio/person-search.tsx`
- Create `src/components/studio/person-editor.tsx`
- Create `src/components/studio/note-editor.tsx`
- Create `src/components/studio/event-editor.tsx`
- Create `src/app/studio/actions.ts`

- [ ] Build person search and duplicate warnings
- [ ] Build person creation with generated permanent code
- [ ] Build person profile with code and note history
- [ ] Build note editor with main message, standout syntax, verse, and visible-from time
- [ ] Build simple event creation/editing

### Task 6: Verification

**Files:**
- Modify files found during QA

- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Start dev server
- [ ] Use browser verification on `/` and `/studio`
- [ ] Test valid code, invalid code, visible notes, locked future note, and editor interactions

