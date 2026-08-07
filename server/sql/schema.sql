-- TAXMINIY SXEMA — kod ichidagi .from()/.select() chaqiruvlaridan chiqarilgan.
-- VPS tayyor bo'lganda buni Supabase'dan olingan haqiqiy pg_dump bilan almashtiring:
--   pg_dump --no-owner --no-acl -h <supabase-host> -U postgres -d postgres -n public > dump.sql
-- va shu faylni dump.sql bilan almashtiring.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'student', -- student | teacher | developer
  balance numeric not null default 0,
  total_spent numeric not null default 0,
  total_time_spent_seconds integer not null default 0,
  last_seen_at timestamptz,
  streak integer not null default 0,
  level text,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  price numeric not null default 0,
  discount_percentage integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists course_images (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  bucket text not null default 'course-images',
  storage_key text not null,
  is_primary boolean not null default false
);

create table if not exists course_parts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_part_id uuid references course_parts(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists lesson_videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  bucket text not null default 'lesson-videos',
  storage_key text not null
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  question text not null,
  options jsonb,
  correct_answer text
);

create table if not exists exercise_audios (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade,
  bucket text not null default 'exercise-audios',
  storage_key text not null
);

create table if not exists user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  duration_days integer not null default 30,
  unique (user_id, course_id)
);

create table if not exists user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists user_exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  answer text,
  is_correct boolean,
  submitted_at timestamptz not null default now()
);

create table if not exists course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists results_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  bucket text not null default 'results-images',
  storage_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tariffs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  description text,
  features jsonb,
  mode text -- 'online' | 'offline'
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  message text,
  created_at timestamptz not null default now()
);
