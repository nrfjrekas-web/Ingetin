import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Btn, Card, Err, FadeIn, Grad, Input, Page, T, TOP } from '../components/ui';
import { ADMIN_WA, C } from '../core/theme';
import { nomorHP } from '../core/phone';
import { bukaWA } from '../services/whatsapp';

const logo = require('../../assets/icon.png');

export default function LoginScreen() {
  const { login, register, daftarDibuka } = useStore();
  const [daftar, setDaftar] = useState(false);
  const [nama, setNama] = useState('');
  const [hp, setHp] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [kode, setKode] = useState('');
  const [ingat, setIngat] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const angka = (f) => (v) => f(v.replace(/\D/g, ''));

  const submit = async () => {
    const no = nomorHP(hp);
    if (!no) return setErr('No HP harus diawali 08 dan 10-13 digit.');
    if (pin.length !== 6) return setErr('PIN harus 6 angka.');
    setBusy(true); setErr(null);
    const e = await (daftar ? register(nama, no, pin, pin2, kode) : login(no, pin, ingat));
    setBusy(false);
    if (e) setErr(e);
  };
  const lupa = () => {
    const no = nomorHP(hp);
    if (!no) return setErr('Isi No HP dulu, lalu ketuk Lupa PIN.');
    bukaWA(ADMIN_WA, `Halo Admin, saya lupa PIN INGETIN, No HP saya ${no}. Tolong resetkan.`);
  };
  return (
    <Page>
      <FadeIn>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
          <Grad style={{ paddingTop: TOP + 24, paddingBottom: 64, alignItems: 'center', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
            <Image source={logo} style={{ width: 128, height: 128, borderRadius: 32 }} />
            <T style={{ color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 12, letterSpacing: 2 }}>INGETIN</T>
            <T style={{ color: '#DBEAFE', fontSize: 16 }}>Catatan All Transaksi</T>
          </Grad>
          <View style={{ paddingHorizontal: 16, marginTop: -32 }}>
            <Card style={{ padding: 20 }}>
              <T style={{ fontWeight: '900', fontSize: 22, marginBottom: 14 }}>{daftar ? 'Buat akun baru' : 'Masuk'}</T>
              {daftar && <Input label="Nama lengkap" value={nama} onChangeText={setNama} />}
              <Input label="No HP (WA)" value={hp} onChangeText={angka(setHp)} keyboardType="phone-pad" maxLength={13} placeholder="08xxxxxxxxxx" />
              <Input label="PIN 6 angka" value={pin} onChangeText={angka(setPin)} keyboardType="number-pad" secureTextEntry maxLength={6} />
              {daftar && <Input label="Ulangi PIN" value={pin2} onChangeText={angka(setPin2)} keyboardType="number-pad" secureTextEntry maxLength={6} />}
              {daftar && <Input label="Kode undangan (No HP pengundang, boleh kosong)" value={kode} onChangeText={angka(setKode)} keyboardType="phone-pad" maxLength={13} />}
              {!daftar && (
                <Pressable onPress={() => setIngat(!ingat)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 6 }}>
                  <Ionicons name={ingat ? 'checkbox' : 'square-outline'} size={28} color={C.blue} />
                  <T style={{ marginLeft: 8 }}>Tetap login / ingat saya</T>
                </Pressable>
              )}
              <Err>{err}</Err>
              <Btn icon={daftar ? 'person-add' : 'log-in'} label={daftar ? 'BUAT AKUN & MASUK' : 'Masuk'} onPress={submit} disabled={busy} />
              {(daftar || daftarDibuka) && <Btn outline label={daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'} onPress={() => { setDaftar(!daftar); setErr(null); }} />}
              {!daftar && <Pressable onPress={lupa} style={{ minHeight: 48, justifyContent: 'center' }}><T style={{ color: C.blue, fontWeight: '800', textAlign: 'center' }}>Lupa PIN?</T></Pressable>}
            </Card>
          </View>
        </ScrollView>
      </FadeIn>
    </Page>
  );
}
