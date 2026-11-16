import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, DateField, Err, Header, Input, Page, T, UangInput } from '../components/ui';
import { C, rp, tgl, today } from '../core/theme';

// Kas harian manual: uang masuk / keluar di luar catatan hutang. Ikut dihitung di Sisa Kas Bulan Ini.
export default function KasScreen({ nav }) {
  const { kas, addKas, deleteKas } = useStore();
  const [tipe, setTipe] = useState('masuk');
  const [jumlah, setJumlah] = useState('');
  const [ket, setKet] = useState('');
  const [tanggal, setTanggal] = useState(today());
  const [err, setErr] = useState(null);
  const simpan = () => {
    const j = parseInt(jumlah || '0', 10);
    if (j <= 0) return setErr('Jumlah harus lebih dari 0.');
    addKas({ tipe, jumlah: j, tgl: tanggal, ket: ket.trim() });
    setJumlah(''); setKet(''); setErr(null);
  };
  const hapus = (k) => Alert.alert('Hapus catatan kas?', 'Data tidak bisa dikembalikan.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => deleteKas(k.id) }]);
  const urut = [...kas].sort((a, b) => new Date(b.tgl) - new Date(a.tgl)).slice(0, 30);
  return (
    <Page>
      <Header title="Kas Harian" onBack={nav.pop} />
      <Body>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Chip label="Kas masuk" color={C.green} selected={tipe === 'masuk'} onPress={() => setTipe('masuk')} />
          <Chip label="Kas keluar" color={C.red} selected={tipe === 'keluar'} onPress={() => setTipe('keluar')} />
        </View>
        <UangInput label="Jumlah" value={jumlah} onChange={setJumlah} />
        <Input label="Keterangan (contoh: Jual pulsa)" value={ket} onChangeText={setKet} />
        <DateField label="Tanggal" value={tanggal} onChange={setTanggal} />
        <Err>{err}</Err>
        <Btn icon="checkmark" label="Simpan" onPress={simpan} />
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 8 }}>Catatan kas terbaru</T>
        {urut.length === 0 && <T style={{ color: C.muted }}>Belum ada catatan kas.</T>}
        {urut.map((k) => (
          <Card key={k.id} onPress={() => hapus(k)} style={{ flexDirection: 'row', justifyContent: 'space-between', borderLeftWidth: 6, borderLeftColor: k.tipe === 'masuk' ? C.green : C.red }}>
            <View style={{ flex: 1 }}>
              <T style={{ fontWeight: '800' }}>{k.ket || (k.tipe === 'masuk' ? 'Kas masuk' : 'Kas keluar')}</T>
              <T style={{ fontSize: 14, color: C.muted }}>{tgl(k.tgl)} · ketuk untuk hapus</T>
            </View>
            <T style={{ fontWeight: '900', color: k.tipe === 'masuk' ? C.green : C.red }}>{k.tipe === 'masuk' ? '+' : '-'}{rp(k.jumlah)}</T>
          </Card>
        ))}
      </Body>
    </Page>
  );
}
