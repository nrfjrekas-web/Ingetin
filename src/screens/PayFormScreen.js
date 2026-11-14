import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Body, Btn, Card, DateField, Err, Header, Input, Page, T, UangInput } from '../components/ui';
import { C, rp, sisa, today } from '../core/theme';

export default function PayFormScreen({ nav, debtId }) {
  const { debts, person, addPay } = useStore();
  const open = debts.filter((d) => sisa(d) > 0);
  const [id, setId] = useState(debtId || null);
  const [jumlah, setJumlah] = useState('');
  const [tgl, setTgl] = useState(today());
  const [ket, setKet] = useState('');
  const [err, setErr] = useState(null);
  const d = open.find((x) => x.id === id);
  const j = parseInt(jumlah || '0', 10);

  const simpan = () => {
    if (!d) return setErr('Pilih dulu hutang yang dibayar.');
    if (j <= 0) return setErr('Jumlah bayar harus lebih dari 0.');
    if (j > sisa(d)) return setErr(`Jumlah melebihi sisa (${rp(sisa(d))}).`);
    const lunas = j === sisa(d);
    addPay(d.id, { jumlah: j, tgl: tgl.toISOString(), ket: ket.trim() });
    nav.pop();
    Alert.alert(lunas ? 'LUNAS ✓' : 'Pembayaran tersimpan');
  };
  return (
    <Page>
      <Header title="Catat Pembayaran" onBack={nav.pop} />
      <Body>
        {open.length === 0 && <T>Semua hutang sudah lunas.</T>}
        {open.map((x) => {
          const on = id === x.id;
          return (
            <Card key={x.id} onPress={() => setId(x.id)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: on ? '#DBEAFE' : '#fff', borderWidth: 2, borderColor: on ? C.blue : 'transparent' }}>
              <View style={{ flex: 1 }}>
                <T style={{ fontWeight: '800' }}>{person(x.personId).nama} · {x.ket}</T>
                <T style={{ fontSize: 16, color: C.muted }}>{x.jenis === 'piutang' ? 'Dia hutang' : 'Saya hutang'} · sisa {rp(sisa(x))}</T>
              </View>
              {on && <Ionicons name="checkmark-circle" size={32} color={C.blue} />}
            </Card>
          );
        })}
        {open.length > 0 && (
          <>
            <UangInput label="Jumlah bayar" value={jumlah} onChange={setJumlah} />
            {d && <Btn outline label={`Bayar lunas (${rp(sisa(d))})`} onPress={() => setJumlah(String(sisa(d)))} />}
            {d && (
              <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <T style={{ fontSize: 16 }}>Sisa hutang awal: {rp(sisa(d))}</T>
                <T style={{ fontSize: 16 }}>- Bayar: {rp(j)}</T>
                <T style={{ fontWeight: '900', color: j > sisa(d) ? C.red : C.blue }}>= Sisa: {j > sisa(d) ? 'melebihi sisa hutang' : rp(sisa(d) - j)}</T>
              </View>
            )}
            <DateField label="Tanggal bayar" value={tgl} onChange={setTgl} />
            <Input label="Keterangan (boleh kosong)" value={ket} onChangeText={setKet} />
            <Err>{err}</Err>
            <Btn icon="checkmark" label="Simpan" onPress={simpan} />
          </>
        )}
      </Body>
    </Page>
  );
}
