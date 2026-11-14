import React from 'react';
import { Alert, View } from 'react-native';
import { useStore } from '../store/store';
import { Avatar, Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { C, rp, sisa, status, tgl } from '../core/theme';
import { kirimWA } from '../services/whatsapp';

export default function PersonScreen({ nav, id }) {
  const { person, debtsOf, deleteDebt } = useStore();
  const p = person(id);
  const ds = debtsOf(id).sort((a, b) => new Date(b.pinjam) - new Date(a.pinjam));
  const sisaTotal = ds.reduce((a, d) => a + sisa(d), 0);
  const dibayarTotal = ds.reduce((a, d) => a + d.awal - sisa(d), 0);
  const hapus = (d) => Alert.alert('Hapus hutang?', 'Yakin hapus hutang ini? Data tidak bisa dikembalikan.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => deleteDebt(d.id) }]);
  const Kecil = ({ children }) => <View style={{ flex: 1 }}>{children}</View>;

  return (
    <Page>
      <Header title={p.nama} onBack={nav.pop} />
      <Body>
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar nama={p.nama} size={64} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T style={{ fontWeight: '900', fontSize: 20 }}>{p.nama}</T>
            <T style={{ fontSize: 15, color: C.muted }}>{p.wa ? 'WA ' + p.wa : 'No WA belum diisi'}</T>
            <T style={{ fontSize: 16, fontWeight: '800', color: C.blue }}>Total sisa {rp(sisaTotal)}</T>
            <T style={{ fontSize: 15 }}>Total sudah dibayar {rp(dibayarTotal)}</T>
          </View>
        </Card>
        {ds.length === 0 && <T>Belum ada catatan untuk orang ini.</T>}
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
              {d.pays.map((y, i) => <T key={i} style={{ fontSize: 16 }}>{tgl(y.tgl)} · {rp(y.jumlah)}{y.ket ? ' · ' + y.ket : ''}</T>)}
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {!st.lunas && <Kecil><Btn icon="cash" label="Bayar" onPress={() => nav.push('PayForm', { debtId: d.id })} /></Kecil>}
                  <Kecil><Btn outline icon="create" label="Edit" onPress={() => nav.push('DebtForm', { debtId: d.id })} /></Kecil>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Kecil><Btn outline color={C.red} icon="trash" label="Hapus" onPress={() => hapus(d)} /></Kecil>
                  {!st.lunas && d.jenis === 'piutang' && <Kecil><Btn outline color={C.green} icon="logo-whatsapp" label="Tagih WA" onPress={() => kirimWA(p, d)} /></Kecil>}
                </View>
              </View>
            </Card>
          );
        })}
      </Body>
    </Page>
  );
}
