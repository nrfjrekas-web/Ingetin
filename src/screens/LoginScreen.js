import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useStore } from '../store/store';
import { Btn, Card, Err, Grad, Input, Page, T, TOP } from '../components/ui';
import { C } from '../core/theme';

const logo = require('../../assets/icon.png');

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
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <Grad style={{ paddingTop: TOP + 24, paddingBottom: 64, alignItems: 'center', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
          <Image source={logo} style={{ width: 128, height: 128, borderRadius: 32 }} />
          <T style={{ color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 12 }}>Ingetin</T>
          <T style={{ color: '#DBEAFE', fontSize: 16 }}>Catatan bon, kas & hutang dusun</T>
        </Grad>
        <View style={{ paddingHorizontal: 16, marginTop: -32 }}>
          <Card style={{ padding: 20 }}>
            <T style={{ fontWeight: '900', fontSize: 22, marginBottom: 14 }}>{daftar ? 'Buat akun baru' : 'Masuk'}</T>
            <Input label="No HP" value={hp} onChangeText={setHp} keyboardType="phone-pad" />
            <Input label="PIN 6 angka" value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, ''))} keyboardType="number-pad" secureTextEntry maxLength={6} />
            <Err>{err}</Err>
            <Btn icon={daftar ? 'person-add' : 'log-in'} label={daftar ? 'Daftar' : 'Masuk'} onPress={submit} disabled={busy} />
            <Btn outline label={daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'} onPress={() => { setDaftar(!daftar); setErr(null); }} />
          </Card>
          <T style={{ color: C.muted, fontSize: 15, textAlign: 'center' }}>Akun demo: 08123456789 / PIN 123456</T>
        </View>
      </ScrollView>
    </Page>
  );
}
