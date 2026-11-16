import React, { useEffect, useRef, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Btn, Card, Err, FadeIn, Grad, Input, Page, T, TOP } from '../components/ui';
import { ADMIN_WA, C } from '../core/theme';
import { nomorHP } from '../core/phone';
import { bukaWA } from '../services/whatsapp';

const logo = require('../../assets/logo.png');

const PinBox = ({ label, value = '', onChange }) => {
  const inputRef = useRef(null);

  return (
    <View style={{ marginBottom: 14 }}>
      <T style={{ fontWeight: '800', marginBottom: 6 }}>{label}</T>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          caretHidden
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const digit = value[i];
          const aktif = value.length === i || (value.length === 6 && i === 5);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 12,
                borderWidth: aktif ? 2 : 1.5,
                borderColor: aktif ? C.blue : digit ? '#93C5FD' : '#CBD5E1',
                backgroundColor: digit ? '#EFF6FF' : '#F8FAFC',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <T style={{ fontSize: 22, fontWeight: '900', color: C.navy }}>
                {digit ? '●' : ''}
              </T>
            </View>
          );
        })}
      </Pressable>
    </View>
  );
};

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
  const [info, setInfo] = useState(null);
  const angka = (f) => (v) => f(v.replace(/\D/g, ''));

  // Tangkap link otomatis (ingetin://daftar?ref=XXXXXX) saat aplikasi dibuka dari luar
  useEffect(() => {
    const bacaLink = (url) => {
      if (!url) return;
      const match = url.match(/[?&]ref=([A-Za-z0-9]{6})/i);
      if (match || url.includes('daftar')) {
        setDaftar(true);
        if (match) setKode(match[1].toUpperCase());
      }
    };
    Linking.getInitialURL().then(bacaLink);
    const sub = Linking.addEventListener('url', (e) => bacaLink(e.url));
    return () => sub.remove();
  }, []);

  const submit = async () => {
    const no = nomorHP(hp);
    if (!no) return setErr('No HP harus diawali 08 dan 10-13 digit.');
    if (pin.length !== 6) return setErr('PIN harus 6 angka.');
    setBusy(true); setErr(null); setInfo(null);
    const e = await (daftar ? register(nama, no, pin, pin2, kode) : login(no, pin, ingat));
    setBusy(false);
    if (e) setErr(e);
    else if (daftar) {
      // Akun sudah dibuat: kembali ke layar Masuk, No HP tetap terisi.
      setDaftar(false); setPin(''); setPin2(''); setKode('');
      setInfo('Akun berhasil dibuat. Silakan masuk dengan No HP dan PIN.');
    }
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
              <PinBox label="PIN 6 angka" value={pin} onChange={setPin} />
              {daftar && <PinBox label="Ulangi PIN" value={pin2} onChange={setPin2} />}
              {daftar && (
                <Input
                  label="Kode referral (6 karakter, boleh kosong)"
                  value={kode}
                  onChangeText={(v) => setKode(v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6))}
                  autoCapitalize="characters"
                  maxLength={6}
                  placeholder="Contoh: A7K92B"
                />
              )}
              {!daftar && (
                <Pressable onPress={() => setIngat(!ingat)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 6 }}>
                  <Ionicons name={ingat ? 'checkbox' : 'square-outline'} size={28} color={C.blue} />
                  <T style={{ marginLeft: 8 }}>Tetap login / ingat saya</T>
                </Pressable>
              )}
              <Err>{err}</Err>
              {info && !err && <T style={{ color: C.green, fontWeight: '800', marginBottom: 10 }}>{info}</T>}
              <Btn icon={daftar ? 'person-add' : 'log-in'} label={daftar ? 'BUAT AKUN & MASUK' : 'Masuk'} onPress={submit} disabled={busy} />
              {(daftar || daftarDibuka) && <Btn outline label={daftar ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'} onPress={() => { setDaftar(!daftar); setPin(''); setPin2(''); setErr(null); setInfo(null); }} />}
              {!daftar && <Pressable onPress={lupa} style={{ minHeight: 48, justifyContent: 'center' }}><T style={{ color: C.blue, fontWeight: '800', textAlign: 'center' }}>Lupa PIN?</T></Pressable>}
            </Card>
          </View>
        </ScrollView>
      </FadeIn>
    </Page>
  );
}
