import React from 'react';
import { View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { C, rp, sisa, status, tgl } from '../core/theme';
import { kirimWA } from '../services/whatsapp';

export default function PersonScreen({ nav, id }) {
  const { person, debtsOf } = useStore();
  const p = person(id);
  const ds = debtsOf(id).sort((a, b) => new Date(b.pinjam) - new Date(a.pinjam));
  return (
    <Page>
      <Header title={p.nama} onBack={nav.pop} />
      <Body>
        {ds.map((d) => {
          const st = status(d);
          return (
            <Card key={d.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T style={{ fontSize: 20, fontWeight: '800', flex: 1 }}>{d.ket || 'Tanpa keterangan'}</T>
                <Chip label={st.label} color={st.color} selected />
              </View>
              <T style={{ fontSize: 15, color: C.muted }}>{d.jenis === 'piutang' ? 'Dia hutang ke saya' : 'Saya hutang ke dia'}</T>
              <T style={{ marginTop: 8 }}>Hutang awal: {rp(d.awal)}</T>
              <T>Sudah dibayar: {rp(d.awal - sisa(d))}</T>
              <T style={{ fontSize: 22, fontWeight: '900', color: st.color }}>Sisa: {rp(sisa(d))}</T>
              <T style={{ fontSize: 15 }}>Pinjam {tgl(d.pinjam)} · tempo {tgl(d.tempo)}</T>
              <View style={{ height: 1, backgroundColor: C.line, marginVertical: 12 }} />
              {d.pays.length === 0 && <T style={{ fontSize: 16 }}>Belum ada pembayaran.</T>}
              {d.pays.map((y, i) => (
                <T key={i} style={{ fontSize: 16 }}>{tgl(y.tgl)} · {rp(y.jumlah)}{y.ket ? ' · ' + y.ket : ''}</T>
              ))}
              {!st.lunas && (
                <View style={{ marginTop: 12 }}>
                  <Btn label="Catat Pembayaran" onPress={() => nav.push('PayForm', { debtId: d.id })} />
                  {d.jenis === 'piutang' && <Btn outline color={C.green} label="Ingatkan via WA" onPress={() => kirimWA(p, d)} />}
                </View>
              )}
            </Card>
          );
        })}
      </Body>
    </Page>
  );
}
