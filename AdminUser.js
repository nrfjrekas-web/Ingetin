import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { supabase } from '../services/supabase';
import { Avatar, Body, Btn, Card, Chip, Header, Input, Page, T } from '../components/ui';
import { aksiAdmin } from '../services/admin';
import { C, jam, rp, tgl } from '../core/theme';
import { bukaWA } from '../services/whatsapp';

// Detail pengguna: data hanya DIBACA (admin tidak bisa mengubah hutang/pembayaran user).
export default function AdminUser({ nav, id }) {
  const [u, setU] = useState(null);
  const [ps, setPs] = useState([]);
  const [ds, setDs] = useState([]);
  const [ys, setYs] = useState([]);
  const [pindah, setPindah] = useState(null);
  const muat = async () => {
    const a = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    setU(a.data);
    setPs((await supabase.from('persons').select('*').eq('user_id', id)).data || []);
    setDs((await supabase.from('debts').select('*').eq('user_id', id).order('dibuat', { ascending: false })).data || []);
    setYs((await supabase.from('payments').select('*').eq('user_id', id)).data || []);
  };
  useEffect(() => { muat(); }, []);
  if (!u) return <Page><Header title="Detail Pengguna" onBack={nav.pop} /></Page>;
  const resetPin = () => Alert.alert('Reset PIN?', `PIN ${u.nama} akan diganti dengan PIN acak baru.`, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Reset', onPress: async () => {
      const r = await aksiAdmin({ aksi: 'reset_pin', user_id: id });
      if (r.error) return Alert.alert('Gagal', r.error);
      Alert.alert('PIN baru', `${r.data.pin}\n\nKirim ke ${u.nama} lewat WhatsApp. PIN ini tidak ditampilkan lagi.`, [
        { text: 'Tutup' },
        { text: 'Kirim via WA', onPress: () => bukaWA(u.no_hp, `Halo ${u.nama}, PIN INGETIN Anda sudah direset Admin. PIN baru: ${r.data.pin}. Segera ganti di menu Akun.`) }]);
    } }]);
  const pindahNomor = async () => {
    const r = await aksiAdmin({ aksi: 'pindah_nomor', user_id: id, no_hp_baru: pindah });
    if (r.error) return Alert.alert('Gagal', r.error);
    setPindah(null);
    Alert.alert('Berhasil', `Akun dipindahkan ke ${r.data.no_hp}. Semua data tetap ada.`);
    muat();
  };
  const hapusAkun = () => Alert.alert('Hapus akun?', `Akun ${u.nama} dan SEMUA datanya akan dihapus permanen. Tidak bisa dikembalikan.`, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus', style: 'destructive', onPress: async () => {
      const r = await aksiAdmin({ aksi: 'hapus_akun', user_id: id });
      if (r.error) return Alert.alert('Gagal', r.error);
      Alert.alert('Terhapus', 'Akun sudah dihapus.');
      nav.pop();
    } }]);
  const blokir = () => Alert.alert(u.blokir ? 'Buka blokir?' : 'Blokir akun?', u.blokir ? 'User bisa login lagi.' : 'User tidak bisa login dan melihat "Akun diblokir, hubungi Admin".', [
    { text: 'Batal', style: 'cancel' },
    { text: 'Ya', onPress: async () => { const r = await supabase.rpc('admin_blokir', { p_id: id, p_nilai: !u.blokir }); if (r.error) Alert.alert('Gagal', r.error.message); else muat(); } }]);
  return (
    <Page>
      <Header title="Detail Pengguna" onBack={nav.pop} />
      <Body>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar nama={u.nama} size={60} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ fontWeight: '900', fontSize: 20 }}>{u.nama}</T>
            <T style={{ fontSize: 15 }}>{u.no_hp}</T>
            <T style={{ fontSize: 14, color: C.muted }}>Daftar {tgl(u.dibuat)} · aktif {jam(u.terakhir_aktif)}</T>
          </View>
          {u.blokir && <Chip label="DIBLOKIR" color={C.red} selected />}
        </Card>
        <Btn outline color={u.blokir ? C.green : C.red} icon={u.blokir ? 'lock-open' : 'ban'} label={u.blokir ? 'Buka Blokir' : 'Blokir Akun'} onPress={blokir} />
        <Btn outline color={C.green} icon="logo-whatsapp" label="Kirim Pesan Bantuan via WA" onPress={() => bukaWA(u.no_hp, `Halo ${u.nama}, ini Admin INGETIN. `)} />
        <Btn outline color={C.blue} icon="key" label="Reset PIN User" onPress={resetPin} />
        {pindah === null ? (
          <Btn outline color={C.blue} icon="swap-horizontal" label="Pindahkan Akun ke Nomor Baru" onPress={() => setPindah('')} />
        ) : (
          <Card>
            <Input label="Nomor HP baru (08…)" value={pindah} onChangeText={(v) => setPindah(v.replace(/\D/g, ''))} keyboardType="phone-pad" maxLength={13} />
            <Btn icon="checkmark" label="Pindahkan" onPress={pindahNomor} />
            <Btn outline label="Batal" onPress={() => setPindah(null)} />
          </Card>
        )}
        <Btn outline color={C.red} icon="trash" label="Hapus Akun" onPress={hapusAkun} />
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 8 }}>Hutang & Pembayaran (hanya baca)</T>
        {ds.length === 0 && <T style={{ color: C.muted }}>Belum ada catatan.</T>}
        {ds.map((d) => {
          const bayar = ys.filter((y) => y.debt_id === d.id);
          const sisa = Number(d.jumlah_awal) - bayar.reduce((a, y) => a + Number(y.jumlah_bayar), 0);
          const p = ps.find((x) => x.id === d.person_id);
          return (
            <Card key={d.id}>
              <T style={{ fontWeight: '800' }}>{p ? p.nama : '-'} · {d.keterangan || 'Tanpa keterangan'}</T>
              <T style={{ fontSize: 15 }}>{d.jenis === 'piutang' ? 'Piutang' : 'Hutang'} {rp(Number(d.jumlah_awal))} · sisa {rp(sisa)} · tempo {tgl(d.jatuh_tempo + 'T00:00:00')}</T>
              {bayar.map((y) => <T key={y.id} style={{ fontSize: 14, color: C.muted }}>{tgl(y.tanggal_bayar + 'T00:00:00')} · bayar {rp(Number(y.jumlah_bayar))}</T>)}
            </Card>
          );
        })}
      </Body>
    </Page>
  );
}
