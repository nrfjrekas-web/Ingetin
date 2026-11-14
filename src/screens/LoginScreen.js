import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Err, Input, Page, T } from '../components/ui';
import { APP, C } from '../core/theme';

export default function LoginScreen() {
  const { login, register } = useStore();
  const [hp, setHp] = useState('');
  const [pin, setPin] = useState('');
  const [daftar, setDaftar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setBusy(true); setErr(null);
    const e = await (daftar ? register(hp.trim(), pin) : login(hp.trim(), pin));
    setBusy(false);
    if (e) setErr(e);
  };
  return (
    <Page>
      <Body>
        <View style={{ height: 32 }} />
        <T style={{ fontSize: 40, fontWeight: '900', color: C.blue }}>{APP}</T>
        <T style={{ marginBottom: 32 }}>Catatan bon, kas & hutang dusun</T>
        <Input label="No HP" value={hp} onChangeText={setHp} keyboardType="phone-pad" />
        <Input label="PIN 6 angka" value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, ''))}
          keyboardType="number-pad" secureTextEntry maxLength={6} />
        <Err>{err}</Err>
        <Btn label={daftar ? 'Daftar' : 'Masuk'} onPress={submit} disabled={busy} />
        <Btn outline label={daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          onPress={() => { setDaftar(!daftar); setErr(null); }} />
        <T style={{ color: C.muted, fontSize: 15, textAlign: 'center' }}>Akun demo: 08123456789 / PIN 123456</T>
      </Body>
    </Page>
  );
}
