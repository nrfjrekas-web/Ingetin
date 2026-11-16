import React, { useState } from 'react';
import { Alert } from 'react-native';
import { aksiAdmin } from '../services/admin';
import { bukaWA } from '../services/whatsapp';
import { Body, Btn, Err, Header, Input, Page, T } from '../components/ui';
import { C } from '../core/theme';

// Admin membuat akun untuk user (dipakai saat pendaftaran ditutup / mode undangan).
export default function AdminBuat({ nav }) {
  const [nama, setNama] = useState('');
  const [hp, setHp] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const simpan = async () => {
    setBusy(true); setErr(null);
    const r = await aksiAdmin({ aksi: 'buat_akun', nama, no_hp: hp, pin });
    setBusy(false);
    if (r.error) return setErr(r.error);
    const { pin: pinBaru, no_hp } = r.data;
    setNama(''); setHp(''); setPin('');
    Alert.alert('Akun dibuat', `No HP ${no_hp}\nPIN awal: ${pinBaru}\n\nKirim ke user lewat WhatsApp. PIN ini tidak ditampilkan lagi.`, [
      { text: 'Tutup' },
      { text: 'Kirim via WA', onPress: () => bukaWA(no_hp, `Halo, akun INGETIN Anda sudah dibuat. No HP: ${no_hp}, PIN: ${pinBaru}. Segera ganti PIN di menu Akun.`) }]);
  };
  return (
    <Page>
      <Header title="Buat Akun Baru" onBack={nav.pop} />
      <Body>
        <Input label="Nama lengkap" value={nama} onChangeText={setNama} />
        <Input label="No HP (08…)" value={hp} onChangeText={(v) => setHp(v.replace(/\D/g, ''))} keyboardType="phone-pad" maxLength={13} />
        <Input label="PIN awal 6 angka (kosongkan = dibuatkan acak)" value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />
        <Err>{err}</Err>
        <Btn icon="person-add" label="Buat Akun" onPress={simpan} disabled={busy} />
        <T style={{ fontSize: 14, color: C.muted }}>Akun langsung aktif. Pengguna sebaiknya mengganti PIN setelah masuk pertama kali.</T>
      </Body>
    </Page>
  );
}
