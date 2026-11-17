import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aksiAdmin } from '../services/admin';
import { Body, Btn, Card, Chip, Err, Header, Input, Page, T } from '../components/ui';
import { C } from '../core/theme';

// Admin mengirim notifikasi ke semua pengguna atau satu pengguna. Muncul di halaman Notifikasi (lonceng) dan sebagai push di HP.
export default function AdminNotif({ nav }) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [target, setTarget] = useState('semua');
  const [hp, setHp] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const kirim = () => {
    if (judul.trim().length < 3 || isi.trim().length < 3) return setErr('Judul dan isi notifikasi wajib diisi.');
    if (target === 'nomor' && hp.length < 10) return setErr('Isi No HP tujuan dulu.');
    setErr(null);
    Alert.alert('Kirim notifikasi?', target === 'semua' ? 'Notifikasi akan dikirim ke SEMUA pengguna.' : `Notifikasi akan dikirim ke ${hp}.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Kirim', onPress: async () => {
        setBusy(true);
        const r = await aksiAdmin({ aksi: 'kirim_notif', judul, isi, target, no_hp: hp });
        setBusy(false);
        if (r.error) return setErr(r.error);
        setJudul(''); setIsi('');
        Alert.alert('Terkirim', `Masuk ke ${r.data.jumlah} pengguna, ${r.data.push} di antaranya juga lewat push di HP.`);
      } }]);
  };
  return (
    <Page>
      <Header title="Kirim Notifikasi" onBack={nav.pop} />
      <Body>
        <T style={{ fontWeight: '800', marginBottom: 6 }}>Tujuan</T>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Chip label="Semua pengguna" selected={target === 'semua'} onPress={() => setTarget('semua')} />
          <Chip label="Satu pengguna" selected={target === 'nomor'} onPress={() => setTarget('nomor')} />
        </View>
        {target === 'nomor' && <Input label="No HP tujuan (08…)" value={hp} onChangeText={(v) => setHp(v.replace(/\D/g, ''))} keyboardType="phone-pad" maxLength={13} />}
        <Input label={`Judul (${judul.length}/60)`} value={judul} onChangeText={(v) => setJudul(v.slice(0, 60))} />
        <Input label={`Isi pesan (${isi.length}/240)`} value={isi} onChangeText={(v) => setIsi(v.slice(0, 240))} multiline numberOfLines={5} textAlignVertical="top" />
        <T style={{ fontWeight: '800', marginBottom: 6 }}>Pratinjau</T>
        <Card style={{ flexDirection: 'row', alignItems: 'center', borderLeftWidth: 6, borderLeftColor: C.blue }}>
          <Ionicons name="notifications" size={26} color={C.blue} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ fontWeight: '900' }}>{judul || 'Judul notifikasi'}</T>
            <T style={{ fontSize: 15 }}>{isi || 'Isi pesan akan tampil di sini.'}</T>
          </View>
        </Card>
        <Err>{err}</Err>
        <Btn icon="megaphone" label="Kirim Notifikasi" onPress={kirim} disabled={busy} />
        <T style={{ fontSize: 13, color: C.muted }}>Pengguna yang mematikan notifikasi push tetap menerima pesan ini di halaman Notifikasi (ikon lonceng).</T>
      </Body>
    </Page>
  );
}
