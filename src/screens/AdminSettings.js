import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { C, jam } from '../core/theme';

export default function AdminSettings({ nav }) {
  const { setDaftarDibuka } = useStore();
  const [buka, setBuka] = useState(true);
  const [log, setLog] = useState([]);
  const muat = async () => {
    const s = await supabase.from('app_settings').select('daftar_dibuka').eq('id', 1).maybeSingle();
    if (s.data) setBuka(s.data.daftar_dibuka);
    setLog((await supabase.from('admin_log').select('*').order('dibuat', { ascending: false }).limit(20)).data || []);
  };
  useEffect(() => { muat(); }, []);
  const simpan = async () => {
    const r = await supabase.rpc('admin_pengaturan', { p_buka: buka, p_mode: buka ? 'terbuka' : 'undangan' });
    if (r.error) return Alert.alert('Gagal', r.error.message);
    setDaftarDibuka(buka);
    Alert.alert('Tersimpan', buka ? 'Pendaftaran DIBUKA.' : 'Pendaftaran DITUTUP. Tombol Daftar disembunyikan.');
    muat();
  };
  return (
    <Page>
      <Header title="Pengaturan & Log" onBack={nav.pop} />
      <Body>
        <Card>
          <T style={{ fontWeight: '900', marginBottom: 8 }}>Izinkan Pendaftaran Baru</T>
          <T style={{ fontWeight: '900', color: buka ? C.green : C.red }}>Pendaftaran: {buka ? 'DIBUKA' : 'DITUTUP'}</T>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Chip label="Mode Terbuka (ON)" color={C.green} selected={buka} onPress={() => setBuka(true)} />
            <Chip label="Ditutup (OFF)" color={C.red} selected={!buka} onPress={() => setBuka(false)} />
          </View>
          <T style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>Jika OFF, tombol Daftar hilang di layar login. User lama tetap bisa login.</T>
          <Btn label="Simpan Pengaturan" onPress={simpan} />
        </Card>
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 8 }}>Log Aktivitas Admin</T>
        {log.length === 0 && <T style={{ color: C.muted }}>Belum ada aktivitas.</T>}
        {log.map((l) => (
          <Card key={l.id} style={{ padding: 12 }}>
            <T style={{ fontWeight: '800', fontSize: 16 }}>{l.aksi}</T>
            <T style={{ fontSize: 14, color: C.muted }}>Admin Developer · {l.target || '-'} · {jam(l.dibuat)}</T>
          </Card>
        ))}
        <T style={{ fontSize: 14, color: C.muted }}>Backup harian otomatis hanya tersedia di paket berbayar Supabase. Di paket gratis, backup dilakukan manual dari dashboard Supabase.</T>
      </Body>
    </Page>
  );
}
