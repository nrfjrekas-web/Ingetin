import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Card, DateField, Err, Header, Input, Page, T } from '../components/ui';
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

  const simpan = () => {
    const j = parseInt(jumlah || '0', 10);
    if (!d) return setErr('Pilih dulu hutang yang dibayar.');
    if (j <= 0) return setErr('Jumlah bayar harus lebih dari 0.');
    if (j > sisa(d)) return setErr(`Jumlah melebihi sisa (${rp(sisa(d))}).`);
    addPay(d.id, { jumlah: j, tgl: tgl.toISOString(), ket: ket.trim() });
    nav.pop();
    Alert.alert(j === sisa(d) ? 'LUNAS ✓' : 'Pembayaran tersimpan');
  };
  return (
    <Page>
      <Header title="Catat Pembayaran" onBack={nav.pop} />
      <Body>
        {open.length === 0 && <T>Semua hutang sudah lunas.</T>}
        {open.map((x) => (
          <Card key={x.id} onPress={() => setId(x.id)} style={{ borderColor: id === x.id ? C.blue : C.line, borderWidth: id === x.id ? 3 : 1 }}>
            <T style={{ fontWeight: '800' }}>{person(x.personId).nama} · {x.ket}</T>
            <T style={{ fontSize: 16, color: C.muted }}>{x.jenis === 'piutang' ? 'Dia hutang' : 'Saya hutang'} · sisa {rp(sisa(x))}</T>
          </Card>
        ))}
        {open.length > 0 && (
          <>
            <Input label="Jumlah bayar (Rp)" value={jumlah} onChangeText={(v) => setJumlah(v.replace(/\D/g, ''))} keyboardType="number-pad" />
            {d && <Btn outline label={`Bayar lunas (${rp(sisa(d))})`} onPress={() => setJumlah(String(sisa(d)))} />}
            <DateField label="Tanggal bayar" value={tgl} onChange={setTgl} />
            <Input label="Keterangan (boleh kosong)" value={ket} onChangeText={setKet} />
            <Err>{err}</Err>
            <Btn label="Simpan" onPress={simpan} />
          </>
        )}
      </Body>
    </Page>
  );
}
