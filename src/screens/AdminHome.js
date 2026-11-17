import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { C, rp, tgl } from '../core/theme';

const Stat = ({ label, nilai, warna }) => (
  <View style={{ width: '48%', backgroundColor: warna, borderRadius: 16, padding: 14, marginBottom: 12 }}>
    <T style={{ color: '#fff', fontSize: 14 }}>{label}</T>
    <T style={{ color: '#fff', fontSize: 24, fontWeight: '900' }} numberOfLines={1} adjustsFontSizeToFit>{nilai}</T>
  </View>
);

export default function AdminHome({ nav }) {
  const { phone } = useStore();
  const [st, setSt] = useState(null);
  const [users, setUsers] = useState([]);
  const [lap, setLap] = useState([]);
  const [err, setErr] = useState(null);
  useEffect(() => {
    (async () => {
      const s = await supabase.rpc('admin_statistik');
      if (s.error) return setErr('Tidak ada akses admin. Pastikan akun ini sudah dijadikan admin di database.');
      setSt(s.data);
      const u = await supabase.from('profiles').select('id,nama,no_hp,dibuat').eq('role', 'user').order('dibuat', { ascending: false }).limit(5);
      setUsers(u.data || []);
      const l = await supabase.from('reports').select('id,isi,status,dibuat,profiles(nama)').order('dibuat', { ascending: false }).limit(5);
      setLap(l.data || []);
    })();
  }, []);
  const hari = st ? st.transaksi_7_hari : [];
  const maks = Math.max(1, ...hari.map((x) => x.jml));
  return (
    <Page>
      <Header title="Dashboard Admin" onBack={nav.pop} />
      <Body>
        <T style={{ fontWeight: '900', fontSize: 22 }}>Halo, Admin Developer</T>
        <T style={{ fontSize: 15, color: C.muted, marginBottom: 12 }}>Login sebagai: Admin Developer ({phone})</T>
        {err && <T style={{ color: C.red }}>{err}</T>}
        {st && (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <Stat label="Total Pengguna Terdaftar" nilai={String(st.total_user)} warna={C.blue} />
              <Stat label="Pengguna Aktif Hari Ini" nilai={String(st.aktif_hari_ini)} warna={C.green} />
              <Stat label="Total Hutang Semua User" nilai={rp(Number(st.total_hutang))} warna={C.red} />
              <Stat label="Laporan Masalah Baru" nilai={String(st.laporan_baru)} warna="#CA8A04" />
            </View>
            <Card>
              <T style={{ fontWeight: '800', marginBottom: 8 }}>Transaksi 7 Hari Terakhir</T>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
                {hari.map((x) => (
                  <View key={x.tgl} style={{ flex: 1, alignItems: 'center' }}>
                    <T style={{ fontSize: 12 }}>{x.jml}</T>
                    <View style={{ width: 22, height: 8 + (80 * x.jml) / maks, backgroundColor: C.blue, borderRadius: 6 }} />
                    <T style={{ fontSize: 11, color: C.muted }}>{x.tgl.slice(8)}</T>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}
        <Btn icon="people" label="Daftar Pengguna" onPress={() => nav.push('AdminUsers')} />
        <Btn outline icon="chatbubbles" label="Laporan Masalah" onPress={() => nav.push('AdminReports')} />
        <Btn outline icon="megaphone" label="Kirim Notifikasi" onPress={() => nav.push('AdminNotif')} />
        <Btn outline icon="settings" label="Pengaturan & Log" onPress={() => nav.push('AdminSettings')} />
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 8 }}>Pengguna Terbaru</T>
        {users.map((u) => (
          <Card key={u.id} onPress={() => nav.push('AdminUser', { id: u.id })}>
            <T style={{ fontWeight: '800' }}>{u.nama}</T>
            <T style={{ fontSize: 14, color: C.muted }}>{u.no_hp} · daftar {tgl(u.dibuat)}</T>
          </Card>
        ))}
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 8 }}>Laporan Terbaru</T>
        {lap.length === 0 && <T style={{ fontSize: 16, color: C.muted }}>Belum ada laporan.</T>}
        {lap.map((l) => (
          <Card key={l.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T style={{ fontWeight: '800', flex: 1 }}>{l.profiles ? l.profiles.nama : '-'}</T>
              <Chip label={l.status} color={l.status === 'Selesai' ? C.green : l.status === 'Baru' ? C.red : C.blue} selected />
            </View>
            <T style={{ fontSize: 15 }} numberOfLines={2}>{l.isi}</T>
          </Card>
        ))}
      </Body>
    </Page>
  );
}
