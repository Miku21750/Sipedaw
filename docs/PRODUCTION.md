# Panduan Production SIPEDAW

Panduan ini menjelaskan persiapan server, deployment, pembaruan aplikasi, backup, dan pengelolaan akun untuk SIPEDAW.

> SIPEDAW menyimpan data pribadi. Gunakan HTTPS, batasi akses database, dan jangan pernah menaruh isi `.env`, dump database, password, atau NIK plaintext di Git.

## 1. Arsitektur yang disarankan

- Node.js 20 atau lebih baru untuk menjalankan Next.js.
- PostgreSQL 17 (atau versi PostgreSQL yang masih didukung).
- Reverse proxy HTTPS, misalnya Nginx, Caddy, atau layanan platform.
- Process manager/service supervisor, misalnya systemd, PM2, atau service milik platform.
- Penyimpanan backup terenkripsi di lokasi terpisah.

`docker-compose.yml` dalam repo hanya menyalakan PostgreSQL dengan kredensial development. Jangan gunakan password `postgres` dari file tersebut untuk server production.

## 2. Persiapan environment

Salin template lalu isi nilainya:

```bash
cp .env.example .env
```

Contoh pembuatan secret:

```bash
# AUTH_SECRET
openssl rand -base64 48

# NIK_ENCRYPTION_KEY (harus tepat 32 byte dalam Base64)
openssl rand -base64 32

# NIK_HASH_SECRET
openssl rand -base64 48
```

Contoh `.env` production:

```dotenv
NODE_ENV="production"
DATABASE_URL="postgresql://sipedaw_app:PASSWORD_KUAT@127.0.0.1:5432/sipedaw?schema=public"
AUTH_SECRET="SECRET_ACAK_MINIMAL_32_KARAKTER"
NIK_ENCRYPTION_KEY="BASE64_DARI_32_BYTE_ACAK"
NIK_HASH_SECRET="SECRET_ACAK_LAIN_YANG_BERBEDA"
```

Aturan penting:

- `AUTH_SECRET` boleh dirotasi, tetapi semua sesi login akan langsung tidak berlaku.
- `NIK_ENCRYPTION_KEY` dan `NIK_HASH_SECRET` wajib dicadangkan di secret manager. Kehilangannya dapat membuat NIK tidak bisa dibaca atau ditemukan.
- Jangan mengganti kunci NIK pada sistem yang sudah berisi data tanpa prosedur migrasi/re-enkripsi.
- Batasi permission file `.env` hanya untuk user yang menjalankan aplikasi.

## 3. Instalasi pertama

Jalankan dari direktori aplikasi:

```bash
npm ci
npm run db:generate
npx prisma migrate deploy
npm run build
npm start
```

Gunakan `prisma migrate deploy` pada production. Perintah `npm run db:migrate` menjalankan `prisma migrate dev` dan hanya ditujukan untuk development.

Sebelum membuka akses pengguna:

```bash
npm test
npm run lint
```

Pastikan reverse proxy meneruskan trafik ke port aplikasi (default `3000`) dan domain hanya dapat diakses melalui HTTPS.

## 4. Akun awal

Seed repo membuat akun development berikut:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin123!` |
| Petugas | `petugas01` | `Petugas123!` |

Untuk instalasi baru, jalankan seed satu kali bila akun awal memang dibutuhkan:

```bash
npm run db:seed
```

Segera login sebagai `admin`, buka **Admin → Kelola User**, lalu ganti password admin. Buat akun petugas production dari halaman tersebut dan nonaktifkan akun contoh `petugas01`.

Seed bersifat idempotent, tetapi tidak mengubah password akun yang sudah ada karena memakai `upsert(..., update: {})`. Menjalankan seed ulang **bukan** cara mereset password.

## 5. Mengelola admin dan petugas

### Membuat akun

1. Login sebagai admin.
2. Buka **Admin → Kelola User**.
3. Tambahkan nama, username, password minimal 8 karakter, dan role.
4. Untuk role `FIELD_OFFICER`, pilih tim.
5. Simpan lalu uji login akun pada jendela privat/incognito.

Username bersifat unik. Akun yang sudah dinonaktifkan tetap memakai username tersebut.

### Mengganti password atau role

1. Buka **Admin → Kelola User**.
2. Edit akun yang dituju.
3. Isi password baru hanya jika password perlu diganti.
4. Pastikan role, tim, dan status aktif sesuai.
5. Simpan, kemudian minta pengguna login ulang.

Session maksimum berlaku 8 jam. Setelah perubahan sensitif, nonaktifkan akun terlebih dahulu bila akses harus diputus segera, lalu aktifkan kembali setelah perubahan selesai.

### Menonaktifkan akun

Gunakan tombol hapus/nonaktifkan pada halaman pengelolaan user. Implementasi SIPEDAW tidak menghapus record; sistem mengubah `isActive` menjadi `false`.

Soft delete ini penting karena user dapat terhubung dengan:

- data warga yang pernah dimasukkan;
- permintaan koreksi;
- review koreksi;
- riwayat export;
- audit log.

Admin tidak dapat menonaktifkan akunnya sendiri. Siapkan minimal dua akun admin production agar pemulihan tidak bergantung pada satu akun.

### Mengaktifkan kembali akun

Edit akun yang dinonaktifkan, ubah status menjadi aktif, dan tetapkan password baru bila diperlukan. Ini adalah pilihan terbaik bila ingin “menghapus lalu membuat ulang” user dengan username yang sama.

### Mengganti user lama dengan user baru

1. Nonaktifkan akun lama.
2. Buat akun baru dengan username berbeda.
3. Jangan memindahkan atau menghapus audit trail akun lama.
4. Pastikan akun baru dapat login sebelum sesi pemeliharaan ditutup.

### Menghapus permanen user

Jangan hard delete user pada operasi normal. Relasi database dapat menolak penghapusan, dan penghapusan paksa dapat merusak jejak audit. Bila penghapusan permanen diwajibkan oleh kebijakan organisasi:

1. buat backup terenkripsi;
2. hentikan sementara operasi penulisan;
3. identifikasi seluruh relasi user;
4. tentukan aturan retensi/anonymization bersama penanggung jawab data;
5. uji prosedur pada salinan database;
6. catat persetujuan dan hasil eksekusi.

## 6. Pemulihan admin darurat

Gunakan prosedur ini hanya bila tidak ada admin aktif yang dapat login.

### Opsi A — Prisma Studio melalui koneksi aman

Jangan membuka Prisma Studio ke internet. Jalankan hanya di server melalui SSH tunnel:

```bash
npx prisma studio --hostname 127.0.0.1 --port 5555
```

Prisma Studio dapat mengaktifkan kembali akun (`isActive=true`), tetapi jangan menulis password plaintext ke `passwordHash`.

### Opsi B — reset password dengan script sementara

Dari direktori aplikasi, dengan `DATABASE_URL` production sudah tersedia:

```bash
ADMIN_USERNAME=admin NEW_ADMIN_PASSWORD='GANTI_DENGAN_PASSWORD_KUAT' npx tsx -e '
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.NEW_ADMIN_PASSWORD;
  if (!username || !password || password.length < 12) {
    throw new Error("Username wajib diisi dan password minimal 12 karakter.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: UserRole.ADMIN, isActive: true, teamId: null },
    create: {
      name: "Administrator",
      username,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log("Admin dipulihkan:", user.username);
}
main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
'
```

Setelah berhasil:

1. hapus password dari shell history bila shell menyimpannya;
2. login dan ubah password sekali lagi melalui UI;
3. periksa audit dan log akses server;
4. pastikan ada admin kedua yang aktif.

Untuk menghindari password masuk shell history, operator dapat menyimpan script pemulihan yang telah direview dan meminta password secara interaktif melalui kanal rahasia organisasi.

## 7. Deployment pembaruan

Sebelum update, baca migration baru dan buat backup:

```bash
git fetch --all --prune
git checkout main
git pull --ff-only
npm ci
npm run db:generate
npm test
npm run lint
npm run build
npx prisma migrate deploy
```

Restart service aplikasi setelah seluruh langkah berhasil. Contoh:

```bash
sudo systemctl restart sipedaw
sudo systemctl status sipedaw
```

Sesuaikan nama service dengan server. Lakukan smoke test:

- halaman login terbuka melalui HTTPS;
- admin dan petugas dapat login;
- role tidak dapat membuka halaman milik role lain;
- pengecekan NIK dan input warga berjalan;
- halaman user/tim admin berjalan;
- export XLSX berhasil;
- log aplikasi tidak mengandung NIK plaintext.

## 8. Backup dan restore

Ikuti prosedur lengkap di [BACKUP.md](BACKUP.md). Backup wajib dilakukan:

- sebelum migration;
- sebelum perubahan massal user/data;
- secara terjadwal sesuai kebijakan retensi.

Uji restore minimal sebulan sekali pada database non-production. Backup belum dianggap valid sebelum pernah berhasil direstore.

## 9. Rollback

Rollback kode:

1. hentikan trafik atau aktifkan maintenance mode;
2. checkout release/commit aplikasi sebelumnya;
3. jalankan `npm ci` dan `npm run build`;
4. restart service;
5. lakukan smoke test.

Jangan membatalkan migration database secara manual tanpa migration balik yang sudah diuji. Bila migration baru merusak data, hentikan penulisan dan restore backup ke database baru, lalu arahkan aplikasi ke database hasil restore setelah verifikasi.

## 10. Checklist go-live

- [ ] Database memakai user khusus dengan password kuat.
- [ ] Semua secret berbeda dari nilai contoh dan tersimpan aman.
- [ ] Kunci NIK sudah dicadangkan terpisah.
- [ ] Migration production selesai.
- [ ] Test, type-check, dan build lulus.
- [ ] HTTPS aktif dan HTTP dialihkan ke HTTPS.
- [ ] Akun contoh sudah diganti password atau dinonaktifkan.
- [ ] Tersedia minimal dua admin aktif.
- [ ] Backup terenkripsi dan uji restore tersedia.
- [ ] Akses SSH/database dibatasi.
- [ ] Monitoring uptime, error, kapasitas disk, dan database aktif.
- [ ] Operator memahami prosedur update, rollback, dan pemulihan admin.

## 11. Catatan scaling

Rate limiter saat ini tersimpan di memori proses. Jalankan satu instance aplikasi, atau pindahkan state rate limiter ke Redis/KV bersama sebelum memakai lebih dari satu instance.
