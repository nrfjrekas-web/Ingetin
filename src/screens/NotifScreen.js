import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Body, Card, Header, Page, T } from '../components/ui';
import { C, jam } from '../core/theme';

export default function NotifScreen({ nav }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    (async () => {
      const r = await supabase.from('notifikasi').select('*').order('dibuat', { ascending: false }).limit(50);
      setList(r.data || []);
      await supabase.from('notifikasi').update({ dibaca: true }).eq('dibaca', false);
    })();
  }, []);
  return (
    <Page>
      <Header title="Notifikasi" onBack={nav.pop} />
      <Body>
        {list.length === 0 && (
          <Card style={{ alignItems: 'center', padding: 28 }}>
            <Ionicons name="notifications-off-outline" size={44} color={C.muted} />
            <T style={{ textAlign: 'center', marginTop: 8 }}>Belum ada notifikasi. Pengingat jatuh tempo muncul di sini setiap pagi.</T>
          </Card>
        )}
        {list.map((n) => (
          <Card key={n.id} style={{ flexDirection: 'row', alignItems: 'center', borderLeftWidth: 6, borderLeftColor: n.tipe === 'd0' || n.tipe.startsWith('d-') ? C.red : C.yellow }}>
            <Ionicons name="notifications" size={26} color={n.dibaca ? C.muted : C.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <T style={{ fontWeight: n.dibaca ? '600' : '900' }}>{n.judul}</T>
              <T style={{ fontSize: 15 }}>{n.isi}</T>
              <T style={{ fontSize: 12, color: C.muted }}>{jam(n.dibuat)}</T>
            </View>
          </Card>
        ))}
      </Body>
    </Page>
  );
}
