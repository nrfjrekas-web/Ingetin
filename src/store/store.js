import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TERHUBUNG } from '../services/supabase';
import { nomorWA } from '../core/phone';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
// Akun memakai No HP + PIN. Di Supabase disimpan sebagai email palsu + sandi (tanpa OTP).
const EMAIL = (hp) => `${hp}@ingetin.app`;
const SANDI = (pin) => `${pin}#ingetin`;
const EMPTY = { persons: [], debts: [] };
const p2 = (n) => String(n).padStart(2, '0');
const fmt = (d) => { const x = new Date(d); return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}`; };
const dari = (s) => new Date(`${s}T00:00:00`).toISOString();
const rapikanWA = (v) => { const n = nomorWA(v); return n ? '0' + n.slice(2) : ''; };
const BELUM = 'Aplikasi belum disambungkan ke Supabase. Isi src/core/config.js.';

// Pembuat 6 kode referral acak (huruf besar & angka tanpa karakter mirip seperti O/0/I/1)
const buatKodeRef = (seed = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hasil = '';
  const sumber = seed ? seed.replace(/[^a-zA-Z0-9]/g, '') : '';
  for (let i = 0; i < 6; i++) {
    const idx = sumber.length > i
      ? (sumber.charCodeAt(i) + i * 7) % chars.length
      : Math.floor(Math.random() * chars.length);
    hasil += chars[idx];
  }
  return hasil;
};

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [sync, setSync] = useState('ok'); // ok | menyimpan | gagal
  const [daftarDibuka, setDaftarDibuka] = useState(true);
  const gagal = useRef({});

  // Ambil semua data dari cloud; kalau offline, pakai salinan terakhir.
  const muat = async (uid) => {
    try {
      const [p, d, y] = await Promise.all([
        supabase.from('persons').select('*').order('dibuat'),
        supabase.from('debts').select('*').order('dibuat'),
        supabase.from('payments').select('*').order('tanggal_bayar'),
      ]);
      const err = p.error || d.error || y.error;
      if (err) throw err;
      const bayar = {};
      y.data.forEach((r) => {
        if (!bayar[r.debt_id]) bayar[r.debt_id] = [];
        bayar[r.debt_id].push({ id: r.id, jumlah: Number(r.jumlah_bayar), tgl: dari(r.tanggal_bayar), ket: r.keterangan || '' });
      });
      const next = {
        persons: p.data.map((r) => ({ id: r.id, nama: r.nama, wa: r.no_wa || '' })),
        debts: d.data.map((r) => ({ id: r.id, personId: r.person_id, jenis: r.jenis, awal: Number(r.jumlah_awal), ket: r.keterangan || '',
          pinjam: dari(r.tanggal_pinjam), tempo: dari(r.jatuh_tempo), pays: bayar[r.id] || [] })),
      };
      setData(next); setSync('ok');
      AsyncStorage.setItem('cache_' + uid, JSON.stringify(next));
    } catch (e) {
      setSync('gagal');
      const c = await AsyncStorage.getItem('cache_' + uid);
      if (c) setData(JSON.parse(c));
    }
  };

  const masuk = async (uid) => {
    const r = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (r.error) return 'Tidak bisa terhubung. Cek internet.';
    if (!r.data) { await supabase.auth.signOut(); return 'Akun tidak ditemukan. Hubungi Admin.'; }
    if (r.data.blokir) { await supabase.auth.signOut(); return 'Akun diblokir, hubungi Admin.'; }

    // Jika akun lama belum punya kode_referral di database, otomatis buatkan & simpan
    let prof = r.data;
    if (!prof.kode_referral) {
      const kodeOtomatis = buatKodeRef(uid);
      prof = { ...prof, kode_referral: kodeOtomatis };
      supabase.from('profiles').update({ kode_referral: kodeOtomatis }).eq('id', uid).then(() => {});
    }

    setProfile(prof);
    supabase.from('profiles').update({ terakhir_aktif: new Date().toISOString() }).eq('id', uid).then(() => {});
    await muat(uid);
    return null;
  };

  useEffect(() => {
    (async () => {
      if (TERHUBUNG) {
        try {
          const s = await supabase.from('app_settings').select('daftar_dibuka').eq('id', 1).maybeSingle();
          if (s.data) setDaftarDibuka(s.data.daftar_dibuka);
          const { data: ses } = await supabase.auth.getSession();
          if (ses.session) {
            if ((await AsyncStorage.getItem('ingat')) === '0') await supabase.auth.signOut();
            else await masuk(ses.session.user.id);
          }
        } catch (e) { /* lanjut ke layar login */ }
      }
      setReady(true);
    })();
  }, []);

  // Login: PIN salah 3x -> dikunci 1 menit.
  const login = async (hp, pin, ingat) => {
    if (!TERHUBUNG) return BELUM;
    const g = gagal.current[hp] || { n: 0, sampai: 0 };
    if (Date.now() < g.sampai) return `PIN salah 3 kali. Coba lagi ${Math.ceil((g.sampai - Date.now()) / 1000)} detik lagi.`;
    const r = await supabase.auth.signInWithPassword({ email: EMAIL(hp), password: SANDI(pin) });
    if (r.error) {
      if (!/invalid/i.test(r.error.message)) return 'Tidak bisa terhubung. Cek internet.';
      g.n += 1;
      const kunci = g.n >= 3;
      if (kunci) { g.n = 0; g.sampai = Date.now() + 60000; }
      gagal.current[hp] = g;
      return kunci ? 'PIN salah 3 kali. Tunggu 1 menit.' : 'PIN salah, coba lagi.';
    }
    gagal.current[hp] = { n: 0, sampai: 0 };
    await AsyncStorage.setItem('ingat', ingat ? '1' : '0');
    return masuk(r.data.user.id);
  };

  // Daftar tanpa OTP. Setelah akun dibuat, sesi ditutup dan pengguna kembali ke layar Masuk.
  const register = async (nm, hp, pin, pin2, kode) => {
    if (!TERHUBUNG) return BELUM;
    if (nm.trim().length < 2) return 'Nama lengkap wajib diisi.';
    if (!/^\d{6}$/.test(pin)) return 'PIN harus 6 angka.';
    if (pin !== pin2) return 'Ulangi PIN tidak sama.';
    let r = await supabase.auth.signUp({ email: EMAIL(hp), password: SANDI(pin) });
    if (r.error) {
      if (!/registered|exists/i.test(r.error.message)) return 'Gagal daftar: ' + r.error.message;
      r = await supabase.auth.signInWithPassword({ email: EMAIL(hp), password: SANDI(pin) });
      if (r.error) return 'No HP sudah terdaftar. Silakan masuk.';
    }
    if (!r.data.session) return 'Di Supabase, matikan dulu "Confirm email" (Authentication > Providers > Email).';
    const uid = r.data.session.user.id;

    // Cari pengundang lewat fungsi database (aman, tidak membuka data user lain).
    let pengundang = null;
    if (kode) {
      const c = await supabase.rpc('cari_pengundang', { p_kode: kode });
      pengundang = c.data || null;
    }

    // Kalau kode referral kebetulan bentrok (sangat jarang), coba lagi dengan kode baru.
    let ins;
    for (let i = 0; i < 3; i++) {
      ins = await supabase.from('profiles').insert({
        id: uid,
        nama: nm.trim(),
        no_hp: hp,
        kode_referral: buatKodeRef(),
        diundang_oleh: pengundang,
      });
      if (!(ins.error && ins.error.code === '23505' && /kode_referral/.test(ins.error.message))) break;
    }
    if (ins.error && ins.error.code !== '23505') {
      await supabase.auth.signOut();
      return /policy|row-level/i.test(ins.error.message) ? 'Pendaftaran sedang ditutup. Hubungi Admin untuk dibuatkan akun.' : ins.error.message;
    }
    await supabase.auth.signOut(); // setelah daftar, kembali ke layar Masuk
    return null;
  };

  const logout = async () => { await supabase.auth.signOut(); setProfile(null); setData(EMPTY); };

  // Setiap ubah data: simpan ke cloud, lalu muat ulang supaya semua angka (termasuk Sisa Kas) ikut berubah.
  const jalan = async (fn) => {
    setSync('menyimpan');
    try {
      const r = await fn();
      if (r && r.error) throw r.error;
      await muat(profile.id);
    } catch (e) {
      setSync('gagal');
      Alert.alert('Belum tersimpan, cek internet', 'Coba lagi setelah internet lancar.');
    }
  };

  const addDebt = (f) => jalan(async () => {
    const wa = rapikanWA(f.wa);
    let p = data.persons.find((x) => x.nama.toLowerCase() === f.nama.toLowerCase());
    if (!p) {
      const r = await supabase.from('persons').insert({ user_id: profile.id, nama: f.nama, no_wa: wa }).select().single();
      if (r.error) return r;
      p = { id: r.data.id };
    } else if (wa) {
      await supabase.from('persons').update({ no_wa: wa }).eq('id', p.id);
    }
    return supabase.from('debts').insert({ user_id: profile.id, person_id: p.id, jenis: f.jenis, jumlah_awal: f.jumlah,
      keterangan: f.ket, tanggal_pinjam: fmt(f.pinjam), jatuh_tempo: fmt(f.tempo) });
  });

  const updateDebt = (id, f) => jalan(async () => {
    const d = data.debts.find((x) => x.id === id);
    await supabase.from('persons').update({ nama: f.nama, no_wa: rapikanWA(f.wa) }).eq('id', d.personId);
    return supabase.from('debts').update({ jenis: f.jenis, jumlah_awal: f.jumlah, keterangan: f.ket,
      tanggal_pinjam: fmt(f.pinjam), jatuh_tempo: fmt(f.tempo) }).eq('id', id);
  });

  const deleteDebt = (id) => jalan(() => supabase.from('debts').delete().eq('id', id));
  const addPay = (debtId, pay) => jalan(() => supabase.from('payments').insert({ user_id: profile.id, debt_id: debtId,
    jumlah_bayar: pay.jumlah, tanggal_bayar: fmt(pay.tgl), keterangan: pay.ket }));

  const value = {
    ready, profile, phone: profile ? profile.no_hp : null, nama: profile ? profile.nama : '',
    kodeReferral: profile ? profile.kode_referral : '',
    isAdmin: !!profile && profile.role === 'admin_developer', sync, daftarDibuka, setDaftarDibuka,
    ...data, login, register, logout, addDebt, updateDebt, deleteDebt, addPay,
    person: (id) => data.persons.find((p) => p.id === id),
    debtsOf: (pid) => data.debts.filter((d) => d.personId === pid),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
