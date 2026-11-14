import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Chip, DateField, Err, Header, Input, Page } from '../components/ui';
import { C, addDays, today } from '../core/theme';

export default function DebtFormScreen({ nav }) {
  const { persons, addDebt } = useStore();
  const [jenis, setJenis] = useState('piutang');
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [ket, setKet] = useState('');
  const [pinjam, setPinjam] = useState(today());
  const [tempo, setTempo] = useState(addDays(today(), 7));
  const [err, setErr] = useState(null);

  const simpan = () => {
    const j = parseInt(jumlah || '0', 10);
    if (!nama.trim()) return setErr('Nama orang wajib diisi.');
    if (j <= 0) return setErr('Jumlah harus lebih dari 0.');
    if (tempo < pinjam) return setErr('Jatuh tempo tidak boleh sebelum tanggal pinjam.');
    addDebt({ nama: nama.trim(), wa: wa.trim(), jenis, jumlah: j, ket: ket.trim(), pinjam, tempo });
    nav.pop();
  };
  return (
    <Page>
      <Header title="Catat Hutang Baru" onBack={nav.pop} />
      <Body>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Chip label="Dia hutang ke saya" color={C.green} selected={jenis === 'piutang'} onPress={() => setJenis('piutang')} />
          <Chip label="Saya hutang" color={C.red} selected={jenis === 'hutang'} onPress={() => setJenis('hutang')} />
        </View>
        <Input label="Nama orang" value={nama} onChangeText={setNama} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {persons.map((p) => <Chip key={p.id} label={p.nama} onPress={() => { setNama(p.nama); setWa(p.wa); }} />)}
        </View>
        <Input label="No WA (boleh kosong)" value={wa} onChangeText={setWa} keyboardType="phone-pad" />
        <Input label="Jumlah (Rp)" value={jumlah} onChangeText={(v) => setJumlah(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        <Input label="Keterangan (contoh: Bon Beras)" value={ket} onChangeText={setKet} />
        <DateField label="Tanggal pinjam" value={pinjam} onChange={setPinjam} />
        <DateField label="Jatuh tempo" value={tempo} onChange={setTempo} />
        <Err>{err}</Err>
        <Btn label="Simpan" onPress={simpan} />
      </Body>
    </Page>
  );
}
