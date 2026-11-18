import React, { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import Chat from '../components/Chat';
import { Header, Page } from '../components/ui';
import { bukaWA } from '../services/whatsapp';

// Admin membalas satu pengguna.
export default function AdminChat({ nav, id }) {
  const [u, setU] = useState(null);
  const [pesan, setPesan] = useState([]);
  const muat = async () => {
    const r = await supabase.from('pesan_bantuan').select('*').eq('user_id', id).order('dibuat');
    if (!r.data) return;
    setPesan(r.data);
    if (r.data.some((m) => m.pengirim === 'user' && !m.dibaca_admin)) {
      supabase.from('pesan_bantuan').update({ dibaca_admin: true }).eq('user_id', id).eq('pengirim', 'user').eq('dibaca_admin', false).then(() => {});
    }
  };
  useEffect(() => {
    supabase.from('profiles').select('nama,no_hp').eq('id', id).maybeSingle().then((r) => setU(r.data));
    muat();
    const t = setInterval(muat, 15000); // cadangan bila koneksi langsung terputus
    // Pesan baru dari pengguna muncul seketika, seperti aplikasi chat.
    const ch = supabase.channel('pb-admin-' + id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pesan_bantuan', filter: `user_id=eq.${id}` }, () => muat())
      .subscribe();
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, []);
  const kirim = async (isi) => {
    const r = await supabase.from('pesan_bantuan').insert({ user_id: id, pengirim: 'admin', isi, dibaca_admin: true });
    if (r.error) { Alert.alert('Belum terkirim', r.error.message); return false; }
    await muat();
    return true;
  };
  return (
    <Page>
      <Header title={u ? u.nama : 'Percakapan'} onBack={nav.pop}
        right={u ? (
          <Pressable onPress={() => bukaWA(u.no_hp, `Halo ${u.nama}, ini Admin INGETIN. `)} hitSlop={10} style={{ padding: 12 }}>
            <Ionicons name="logo-whatsapp" size={26} color="#fff" />
          </Pressable>
        ) : null} />
      <Chat pesan={pesan} saya="admin" onKirim={kirim} />
    </Page>
  );
}
