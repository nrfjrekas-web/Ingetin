import React, { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Body, Btn, Err, Header, Input, Page } from '../components/ui';

export default function LaporScreen({ nav }) {
  const { profile } = useStore();
  const [isi, setIsi] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const kirim = async () => {
    if (isi.trim().length < 5) return setErr('Tulis kendala Anda dulu (minimal 5 huruf).');
    setBusy(true);
    const r = await supabase.from('reports').insert({ user_id: profile.id, isi: isi.trim() });
    setBusy(false);
    if (r.error) return setErr('Belum terkirim, cek internet.');
    nav.pop();
    Alert.alert('Terkirim', 'Laporan Anda sudah masuk ke Admin.');
  };
  return (
    <Page>
      <Header title="Laporkan Masalah" onBack={nav.pop} />
      <Body>
        <Input label="Tulis kendala Anda" value={isi} onChangeText={setIsi} multiline numberOfLines={6} textAlignVertical="top" />
        <Err>{err}</Err>
        <Btn icon="send" label="Kirim Laporan" onPress={kirim} disabled={busy} />
      </Body>
    </Page>
  );
}
