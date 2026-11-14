# Ingetin (React Native / Expo)

Aplikasi catatan bon, kas & hutang dusun. Akun demo: 08123456789 / PIN 123456.

## Struktur (mau ubah apa, buka file ini)
```
App.js                        Daftar layar + tombol Back Android
src/
  core/theme.js               Nama app, warna, format Rp & tanggal, aturan sisa/status hutang
  store/store.js              Login, daftar, simpan data per akun, tambah hutang/bayar
  store/seed.js               Data contoh akun demo
  services/whatsapp.js        Tombol Ingatkan via WA (isi pesan di sini)
  components/ui.js            Tombol, kolom isian, kartu, pemilih tanggal
  screens/
    BerandaScreen.js          Dashboard
    DaftarScreen.js           Daftar orang, cari, filter
    PersonScreen.js           Detail orang + riwayat
    DebtFormScreen.js         Form hutang baru
    PayFormScreen.js          Form pembayaran
.github/workflows/build.yml   Build APK lewat EAS (jalankan manual di tab Actions)
```

## Belum ada
Laporan + grafik + export, kas harian manual, sidik jari, notifikasi, sinkron server, batas percobaan PIN, koreksi/hapus pembayaran.
Data tersimpan di HP (AsyncStorage), belum ke server.

## Cloud (Supabase)
- `supabase/schema.sql`: tempel dan Run sekali di Supabase SQL Editor (tabel, keamanan, fungsi admin).
- `src/core/config.js`: isi URL dan kunci anon/publishable (JANGAN kunci service_role).
- Layar admin: AdminHome, AdminUsers, AdminUser, AdminReports, AdminSettings (hanya terbuka untuk role admin_developer).
