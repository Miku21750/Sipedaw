# SIPEDAW — Sistem Pendataan Warga

Starter MVP untuk pendataan warga menggunakan Next.js App Router, TypeScript, Prisma, PostgreSQL, Zod, JWT session cookie, dan role-based access control.

## Fitur yang sudah tersedia

- Login admin dan petugas.
- Session disimpan dalam cookie `httpOnly`.
- Dashboard berbeda untuk admin dan petugas.
- Pengecekan NIK sebelum form dibuka.
- NIK unik pada level database.
- Input warga oleh petugas.
- Audit log saat data warga dibuat.
- Daftar dan pencarian warga khusus admin.
- Masking NIK pada tabel admin.
- PostgreSQL lokal melalui Docker Compose.

## Menjalankan proyek

Persyaratan: Node.js 20+ dan Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

## Akun awal

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin123!` |
| Petugas | `petugas01` | `Petugas123!` |

Ganti password seed sebelum deployment.

## Struktur utama

```text
src/app/api              Route handlers
src/app/admin            Halaman admin
src/app/petugas          Halaman petugas
src/lib                  Prisma, auth, audit, response helper
src/validation           Skema validasi Zod
prisma/schema.prisma     Struktur database
prisma/seed.ts           Akun awal
```

## Batas MVP saat ini

- Admin belum dapat mengedit atau menonaktifkan warga melalui UI.
- Belum ada pengelolaan user dan tim.
- Belum ada export Excel.
- Belum ada pengajuan koreksi.
- NIK belum dienkripsi di database; akses database dan backup harus diamankan.
- Rate limiting login dan pengecekan NIK belum diterapkan.

## Tahap berikutnya

1. CRUD admin untuk warga, user, dan tim.
2. Status verifikasi serta penonaktifan tanpa hard delete.
3. Pengajuan koreksi dari petugas.
4. Export XLSX dengan export log.
5. Rate limiting, CSRF review, dan enkripsi NIK.
6. Automated tests dan backup procedure.
