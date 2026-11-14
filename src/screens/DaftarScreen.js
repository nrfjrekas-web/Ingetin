import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Card, Chip, Header, Page, T } from '../components/ui';
import { C, rp, sisa, status, tgl } from '../core/theme';

const FILTER = ['Semua', 'Belum Lunas', 'Lunas', 'Lewat Tempo'];
const WARNA = { 'Lunas': C.green, 'Lewat Tempo': C.red, 'Belum Lunas': C.blue };

export default function DaftarScreen({ nav }) {
  const { persons, debtsOf } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState('Semua');
  const st = (p) => {
    const ds = debtsOf(p.id);
    if (ds.some((d) => status(d).lewat)) return 'Lewat Tempo';
    return ds.some((d) => sisa(d) > 0) ? 'Belum Lunas' : 'Lunas';
  };
  const list = persons.filter((p) => p.nama.toLowerCase().includes(q.toLowerCase()) && (f === 'Semua' || st(p) === f));

  return (
    <Page>
    <Header title="Hutang & Piutang" />
    <Body>
      <TextInput value={q} onChangeText={setQ} placeholder="Cari nama" placeholderTextColor="#9CA3AF"
        style={{ minHeight: 52, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 14, fontSize: 18, backgroundColor: '#fff', marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {FILTER.map((s) => <Chip key={s} label={s} selected={f === s} onPress={() => setF(s)} />)}
      </View>
      {list.length === 0 && <T>Tidak ada data</T>}
      {list.map((p) => {
        const ds = debtsOf(p.id).filter((d) => sisa(d) > 0);
        const jml = (j) => ds.filter((d) => d.jenis === j).reduce((a, d) => a + sisa(d), 0);
        const tempo = ds.map((d) => d.tempo).sort()[0];
        const s = st(p);
        return (
          <Card key={p.id} onPress={() => nav.push('Person', { id: p.id })}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.blue + '1F', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <T style={{ fontSize: 22, fontWeight: '800', color: C.blue }}>{p.nama[0].toUpperCase()}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontWeight: '800' }}>{p.nama}</T>
                {jml('piutang') > 0 && <T style={{ fontSize: 16, color: C.green, fontWeight: '700' }}>Dia hutang {rp(jml('piutang'))}</T>}
                {jml('hutang') > 0 && <T style={{ fontSize: 16, color: C.red, fontWeight: '700' }}>Saya hutang {rp(jml('hutang'))}</T>}
                {s === 'Lunas' && <T style={{ fontSize: 16, color: C.green, fontWeight: '700' }}>Total pernah hutang {rp(debtsOf(p.id).reduce((a, d) => a + d.awal, 0))} - Sudah Lunas</T>}
                {tempo && <T style={{ fontSize: 15, color: C.muted }}>Tempo {tgl(tempo)}</T>}
              </View>
              <Chip label={s.toUpperCase()} color={WARNA[s]} selected />
            </View>
          </Card>
        );
      })}
    </Body>
    </Page>
  );
}
