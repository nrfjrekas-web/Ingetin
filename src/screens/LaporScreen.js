import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import Chat from '../components/Chat';
import { Header, Page, T } from '../components/ui';
import { C } from '../core/theme';

// Laporkan Masalah = percakapan dengan Admin. Riwayat tersimpan dan Admin bisa membalas.
export default function LaporScreen({ nav }) {
  const { profile } = useStore();
  const [pesan, setPesan] = useState([]);
  const muat = async () => {
    const r = await supabase.from('pesan_bantuan').select('*').eq('user_id', profile.id).order('dibuat');
    if (!r.data) return;
    setPesan(r.data);
    if (r.data.some((m) => m.pengirim === 'admin' && !m.dibaca_user)) {
      supabase.from('pesan_bantuan').update({ dibaca_user: true }).eq('user_id', profile.id).eq('pengirim', 'admin').eq('dibaca_user', false).then(() => {});
    }
  };
  useEffect(() => { muat(); const t = setInterval(muat, 6000); return () => clearInterval(t); }, []);
  const kirim = async (isi) => {
    const r = await supabase.from('pesan_bantuan').insert({ user_id: profile.id, pengirim: 'user', isi, dibaca_user: true });
    if (r.error) { Alert.alert('Belum terkirim', 'Cek internet lalu coba lagi.'); return false; }
    await muat();
    return true;
  };
  return (
    <Page>
      <Header title="Laporkan Masalah" onBack={nav.pop} />
      <Chat pesan={pesan} saya="user" onKirim={kirim}
        kosong={(
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={C.muted} />
            <T style={{ textAlign: 'center', marginTop: 8, fontWeight: '800' }}>Ceritakan kendalamu</T>
            <T style={{ textAlign: 'center', fontSize: 14, color: C.muted }}>Tulis di bawah. Admin akan membalas di sini, dan kamu mendapat notifikasi saat ada balasan.</T>
          </View>
        )} />
    </Page>
  );
}
