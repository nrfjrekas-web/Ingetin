import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { supabase } from '../services/supabase';
import { Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { C, jam } from '../core/theme';
import { bukaWA } from '../services/whatsapp';

const STATUS = ['Baru', 'Diproses', 'Selesai'];

export default function AdminReports({ nav }) {
  const [list, setList] = useState([]);
  const muat = async () => {
    const r = await supabase.from('reports').select('id,isi,status,dibuat,profiles(nama,no_hp)').order('dibuat', { ascending: false });
    setList(r.data || []);
  };
  useEffect(() => { muat(); }, []);
  const ubah = async (id, status) => {
    const r = await supabase.rpc('admin_status_laporan', { p_id: id, p_status: status });
    if (r.error) Alert.alert('Gagal', r.error.message); else muat();
  };
  return (
    <Page>
      <Header title="Laporan Masalah" onBack={nav.pop} />
      <Body>
        {list.length === 0 && <T>Belum ada laporan.</T>}
        {list.map((l) => (
          <Card key={l.id}>
            <T style={{ fontWeight: '800' }}>{l.profiles ? l.profiles.nama : '-'}</T>
            <T style={{ fontSize: 14, color: C.muted }}>{jam(l.dibuat)}</T>
            <T style={{ marginVertical: 8 }}>{l.isi}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {STATUS.map((s) => <Chip key={s} label={s} selected={l.status === s} onPress={() => ubah(l.id, s)} />)}
            </View>
            {l.profiles && <Btn outline color={C.green} icon="logo-whatsapp" label="Balas via WA" onPress={() => bukaWA(l.profiles.no_hp, `Halo ${l.profiles.nama}, ini Admin INGETIN, soal laporan Anda: `)} />}
          </Card>
        ))}
      </Body>
    </Page>
  );
}
