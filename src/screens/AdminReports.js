import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../services/supabase';
import { Avatar, Body, Card, Header, Page, T } from '../components/ui';
import { C, jam } from '../core/theme';

// Kotak masuk Admin: satu baris per pengguna yang pernah menulis, yang belum dibaca di atas lencana merah.
export default function AdminReports({ nav }) {
  const [list, setList] = useState([]);
  const [muat, setMuat] = useState(true);
  useEffect(() => {
    (async () => {
      const r = await supabase.from('pesan_bantuan').select('user_id,pengirim,isi,dibaca_admin,dibuat,profiles(nama,no_hp)').order('dibuat', { ascending: false }).limit(500);
      const peta = {};
      (r.data || []).forEach((m) => {
        if (!peta[m.user_id]) peta[m.user_id] = { user_id: m.user_id, nama: m.profiles ? m.profiles.nama : '-', terakhir: m, belum: 0 };
        if (m.pengirim === 'user' && !m.dibaca_admin) peta[m.user_id].belum += 1;
      });
      setList(Object.values(peta));
      setMuat(false);
    })();
  }, []);
  return (
    <Page>
      <Header title="Pesan & Laporan" onBack={nav.pop} />
      <Body>
        {!muat && list.length === 0 && <T>Belum ada pesan dari pengguna.</T>}
        {list.map((x) => (
          <Card key={x.user_id} onPress={() => nav.push('AdminChat', { id: x.user_id })} style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
            <Avatar nama={x.nama || '?'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <T style={{ fontWeight: '800' }} numberOfLines={1}>{x.nama}</T>
              <T style={{ fontSize: 14, color: C.muted }} numberOfLines={1}>{x.terakhir.pengirim === 'admin' ? 'Anda: ' : ''}{x.terakhir.isi}</T>
              <T style={{ fontSize: 11, color: C.muted }}>{jam(x.terakhir.dibuat)}</T>
            </View>
            {x.belum > 0 && (
              <View style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                <T style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>{x.belum}</T>
              </View>
            )}
          </Card>
        ))}
      </Body>
    </Page>
  );
}
