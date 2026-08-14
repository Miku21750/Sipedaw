# Prosedur backup dan restore

Backup wajib dienkripsi dan disimpan terpisah dari server aplikasi karena memuat data pribadi. Simpan `NIK_ENCRYPTION_KEY` dan `NIK_HASH_SECRET` di secret manager terpisah; tanpa kunci tersebut NIK dalam backup tidak dapat dipulihkan.

## Backup

1. Pastikan PostgreSQL client (`pg_dump`) tersedia dan `DATABASE_URL` sudah di-export ke environment.
2. Jalankan `powershell -File scripts/backup.ps1 -OutputDirectory D:\backup-sipedaw`.
3. Enkripsi file dump dengan fasilitas organisasi, salin ke penyimpanan off-site, lalu verifikasi ukuran dan checksum.
4. Terapkan retensi harian 7 hari, mingguan 4 minggu, dan bulanan 12 bulan. Batasi akses hanya untuk operator backup.

## Uji restore

Lakukan minimal sebulan sekali pada database kosong/non-produksi:

```powershell
createdb sipedaw_restore_test
pg_restore --exit-on-error --no-owner --dbname="postgresql://postgres:postgres@localhost:5432/sipedaw_restore_test" "D:\backup-sipedaw\sipedaw-YYYYMMDD-HHMMSS.dump"
```

Setelah restore, gunakan salinan konfigurasi kunci yang aman, jalankan aplikasi, dan periksa login, jumlah warga, pembacaan NIK, audit log, koreksi, serta export. Hapus database pengujian melalui prosedur administrasi PostgreSQL setelah hasil dicatat. Jangan pernah menguji restore di database produksi.
