# CEFR LC — self-hosted API

Supabase'ning o'rnini bosuvchi Node/Express + Postgres + MinIO backend. Hozircha
skelet holatida: auth (JWT), namunaviy `courses` CRUD, upload, video signed-URL
va admin (`list-users`/`delete-user`) endpoint'lari tayyor. Qolgan 12 ta jadval
(`profiles` bilan bog'liq boshqa amallar, `tariffs`, `applications` va h.k.)
uchun `courses.ts` dagi patternni takrorlash kerak.

## VPS minimal talablari

- Ubuntu 22.04+, 2 vCPU, 4GB RAM, 40GB disk (boshlash uchun yetarli)
- Docker + Docker Compose o'rnatilgan bo'lishi kerak
- 80/443 portlar ochiq (Nginx + Let's Encrypt uchun, keyinroq qo'shiladi)

## Ishga tushirish (VPS'da)

```bash
cp server/.env.example server/.env   # maxfiy kalitlarni to'ldiring
docker compose up -d --build
curl http://localhost:4000/health
```

## Muhim: ma'lumotlarni ko'chirish

`server/sql/schema.sql` — bu **taxminiy** sxema (frontend kodidagi `.from()`
chaqiruvlaridan chiqarilgan). Supabase'dagi haqiqiy sxema va ma'lumotlarni
ko'chirish uchun:

```bash
pg_dump --no-owner --no-acl -h <supabase-db-host> -U postgres -d postgres -n public > dump.sql
psql -h <vps-ip> -U cefr -d cefr < dump.sql
```

Bundan keyin `schema.sql`ni haqiqiy dump bilan solishtirib, route'lardagi
ustun nomlarini moslashtirish kerak bo'lishi mumkin.

`auth.users`dagi parol hash'lari Supabase'ning ichki formatida bo'lgani uchun
to'g'ridan-to'g'ri ko'chmaydi — foydalanuvchilar birinchi kirishda parolni
"unutdingizmi" oqimi orqali qayta o'rnatishi kerak bo'ladi (bu oqim hali
yozilmagan, TODO).

## Qolgan ishlar (frontend tomonida)

- `src/integrations/supabase/client.ts`ni olib tashlab, yangi
  `src/lib/api-client.ts` yaratish va 30+ faylda `supabase.from()` /
  `supabase.auth.*` chaqiruvlarini shu klientga o'tkazish.
- Har bir jadval uchun `server/src/routes/*.ts` fayllarini `courses.ts`
  namunasi asosida yozib chiqish.
