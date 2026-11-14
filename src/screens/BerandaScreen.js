import React from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, T } from '../components/ui';
import { C, dayDiff, rp, sisa, status, tgl, today } from '../core/theme';
import { kirimWA } from '../services/whatsapp';

const Kartu = ({ label, nilai, warna }) => (
  <View style={{ backgroundColor: warna, borderRadius: 14, padding: 18, marginBottom: 12 }}>
    <T style={{ color: '#fff', fontSize: 17 }}>{label}</T>
    <T style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>{nilai}</T>
  </View>
);

export default function BerandaScreen({ nav }) {
  const { debts, person } = useStore();
  const now = today();
  const open = debts.filter((d) => sisa(d) > 0);
  const total = (j) => open.filter((d) => d.jenis === j).reduce((a, d) => a + sisa(d), 0);
  let kas = 0; // pembayaran piutang masuk dikurangi hutang yang dibayar, bulan ini
  debts.forEach((d) => d.pays.forEach((p) => {
    const x = new Date(p.tgl);
    if (x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth()) kas += d.jenis === 'piutang' ? p.jumlah : -p.jumlah;
  }));
  const rem = open.filter((d) => d.jenis === 'piutang' && dayDiff(d.tempo, now) <= 3)
    .sort((a, b) => new Date(a.tempo) - new Date(b.tempo));
  const latest = [...open].sort((a, b) => new Date(b.pinjam) - new Date(a.pinjam)).slice(0, 5);
  const label = (d) => { const n = dayDiff(d.tempo, now); return n < 0 ? `Lewat ${-n} hari` : n === 0 ? 'Hari ini' : `H-${n}`; };

  return (
    <Body>
      {rem.length > 0 && <T style={{ fontWeight: '800', marginBottom: 8 }}>Perlu ditagih</T>}
      {rem.map((d) => {
        const p = person(d.personId);
        return (
          <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <T style={{ fontWeight: '800' }}>{p.nama} · {rp(sisa(d))}</T>
              <T style={{ fontSize: 16, fontWeight: '700', color: status(d).lewat ? C.red : C.text }}>{label(d)}</T>
            </View>
            <Pressable onPress={() => kirimWA(p, d)} style={{ backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 14, minHeight: 48, justifyContent: 'center' }}>
              <T style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Ingatkan WA</T>
            </Pressable>
          </Card>
        );
      })}
      <View style={{ height: 8 }} />
      <Kartu label="Total Piutang (orang hutang ke saya)" nilai={rp(total('piutang'))} warna={C.green} />
      <Kartu label="Total Hutang (saya hutang ke orang)" nilai={rp(total('hutang'))} warna={C.red} />
      <Kartu label="Sisa Kas Bulan Ini" nilai={(kas < 0 ? '-' : '') + rp(kas)} warna={C.blue} />
      <Btn label="+ Catat Hutang Baru" onPress={() => nav.push('DebtForm')} />
      <Btn outline label="+ Catat Pembayaran" onPress={() => nav.push('PayForm')} />
      <T style={{ fontWeight: '800', marginVertical: 8 }}>Belum lunas terbaru</T>
      {latest.length === 0 && <T>Belum ada catatan. Ketuk "Catat Hutang Baru" untuk mulai.</T>}
      {latest.map((d) => {
        const p = person(d.personId);
        return (
          <Card key={d.id} onPress={() => nav.push('Person', { id: p.id })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T style={{ fontWeight: '800', flex: 1 }}>{p.nama} · {d.ket}</T>
              <T style={{ fontWeight: '800', color: d.jenis === 'piutang' ? C.green : C.red }}>{rp(sisa(d))}</T>
            </View>
            <T style={{ fontSize: 15, color: C.muted }}>{d.jenis === 'piutang' ? 'Dia hutang' : 'Saya hutang'} · tempo {tgl(d.tempo)}</T>
            {status(d).lewat && <View style={{ flexDirection: 'row', marginTop: 6 }}><Chip label="LEWAT TEMPO" color={C.red} selected /></View>}
          </Card>
        );
      })}
    </Body>
  );
}
