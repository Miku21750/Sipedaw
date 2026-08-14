# SIPEDAW — Sistem Pendataan Warga

Sistem pendataan warga menggunakan Next.js App Router, TypeScript, Prisma, PostgreSQL, Zod, JWT session cookie, dan role-based access control.

## Fitur

- Login admin dan petugas dengan session cookie `httpOnly`.
- Dashboard berbeda untuk admin dan petugas.
- Pengecekan NIK sebelum form dibuka dan NIK unik pada database.
- CRUD admin untuk warga, user, dan tim.
- Verifikasi dan penonaktifan data tanpa hard delete.
- Pengajuan koreksi petugas dengan review admin.
- Export XLSX dan riwayat export.
- NIK terenkripsi AES-256-GCM dengan hash HMAC untuk pencarian tepat.
- Rate limiting login/pengecekan NIK, validasi same-origin untuk CSRF, dan security headers.
- Audit log, automated tests, dan prosedur backup/restore.

## Menjalankan proyek

Persyaratan: Node.js 20+, Docker, dan PostgreSQL client untuk operasi backup.

```bash
cp .env.example .env
# Isi AUTH_SECRET, NIK_ENCRYPTION_KEY, dan NIK_HASH_SECRET dengan nilai acak yang aman.
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

## Upgrade database lama

Setelah migrasi fase kedua, NIK lama masih berada sementara pada kolom kompatibilitas agar migrasi tidak menghilangkan data. Enkripsi seluruh data lama dengan:

```bash
npm run db:migrate
npm run db:encrypt-existing
```

Pastikan `NIK_ENCRYPTION_KEY` dan `NIK_HASH_SECRET` sudah terisi dan dicadangkan di secret manager. Entri baru tidak menyimpan plaintext.

## Pemeriksaan kualitas

```bash
npm test
npm run lint
npm run build
```

Prosedur backup dan uji restore tersedia di [`docs/BACKUP.md`](docs/BACKUP.md).

## Struktur utama

```text
src/app/api              Route handlers
src/app/admin            Halaman admin
src/app/petugas          Halaman petugas
src/lib                  Prisma, auth, audit, enkripsi, keamanan request
src/validation           Skema validasi Zod
prisma/schema.prisma     Struktur database
prisma/seed.ts           Akun awal
tests                    Automated tests
scripts                  Utilitas migrasi NIK dan backup
```

## Catatan deployment

- Rate limiter bawaan menggunakan memori proses dan cocok untuk satu instance. Untuk deployment multi-instance, gunakan Redis/KV bersama.
- HTTPS wajib digunakan pada deployment produksi.
- Jangan mencatat NIK plaintext di log aplikasi, audit log, atau sistem monitoring.
