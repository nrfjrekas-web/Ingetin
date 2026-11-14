import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Avatar, Card, Chip, Grad, T, TOP } from '../components/ui';
import { C, dayDiff, hitungUlangSisaKas, rp, sisa, status, tgl, today } from '../core/theme';
import { kirimWA } from '../services/whatsapp';

const logo = require('../../assets/icon.png');
const sapa = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; };

const Total = ({ label, sub, nilai, colors, icon }) => (
  <Grad colors={colors} style={{ flex: 1, borderRadius: 18, padding: 14, elevation: 5 }}>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff33', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <T style={{ color: '#fff', fontWeight: '900', marginTop: 8, fontSize: 17 }}>{label}</T>
    <T style={{ color: '#ffffffcc', fontSize: 12 }}>{sub}</T>
    <T style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>{nilai}</T>
  </Grad>
);

const Aksi = ({ label, icon, bg, fg, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, minHeight: 96, borderRadius: 18, backgroundColor: bg, padding: 14, justifyContent: 'space-between', elevation: 4, opacity: pressed ? 0.85 : 1 })}>
    <Ionicons name={icon} size={32} color={fg} />
    <T style={{ color: fg, fontWeight: '900', fontSize: 16 }}>{label}</T>
  </Pressable>
);

export default function BerandaScreen({ nav }) {
  const { debts, person, sync, user } = useStore();
  const now = today();
  const open = debts.filter((d) => sisa(d) > 0);
  const total = (j) => open.filter((d) => d.jenis === j).reduce((a, d) => a + sisa(d), 0);
  const kas = hitungUlangSisaKas(debts);
  const rem = open.filter((d) => d.jenis === 'piutang' && dayDiff(d.tempo, now) <= 3)
    .sort((a, b) => new Date(a.tempo) - new Date(b.tempo));
  const latest = [...open].sort((a, b) => new Date(b.pinjam) - new Date(a.pinjam)).slice(0, 5);
  const label = (d) => { const n = dayDiff(d.tempo, now); return n < 0 ? `Lewat ${-n} hari` : n === 0 ? 'Hari ini' : `H-${n}`; };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Grad style={{ paddingTop: TOP + 12, paddingHorizontal: 20, paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={logo} style={{ width: 52, height: 52, borderRadius: 14 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ color: '#BFDBFE', fontSize: 15 }}>{sapa()} 👋</T>
            <T style={{ color: '#fff', fontSize: 22, fontWeight: '900' }} numberOfLines={1}>
              {user?.nama || user?.name || 'INGETIN'}
            </T>
          </View>
        </View>
        <T style={{ color: '#DBEAFE', fontSize: 16, marginTop: 18 }}>Sisa Kas Bulan Ini</T>
        <T style={{ color: '#fff', fontSize: 38, fontWeight: '900' }} numberOfLines={1} adjustsFontSizeToFit>{(kas.sisa < 0 ? '-' : '') + rp(kas.sisa)}</T>
        <T style={{ color: '#BFDBFE', fontSize: 13 }}>{`Uang masuk ${rp(kas.masuk)} - uang keluar ${rp(kas.keluar)} bulan ini`}</T>
        <T style={{ color: sync === 'gagal' ? '#FDE68A' : '#BFDBFE', fontSize: 13, fontWeight: '800', marginTop: 2 }}>{sync === 'ok' ? 'Tersimpan di Cloud ✓' : sync === 'menyimpan' ? 'Menyimpan...' : 'Belum tersimpan, cek internet'}</T>
      </Grad>

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: -32, gap: 12 }}>
        <Total label="Piutang" sub="orang hutang ke saya" nilai={rp(total('piutang'))} colors={['#15803D', '#22C55E']} icon="arrow-down-circle" />
        <Total label="Hutang" sub="saya hutang ke orang" nilai={rp(total('hutang'))} colors={['#B91C1C', '#F87171']} icon="arrow-up-circle" />
      </View>

      {rem.length > 0 && (
        <View style={{ margin: 16, marginBottom: 0, backgroundColor: C.yellowBg, borderRadius: 18, padding: 14, borderWidth: 2, borderColor: C.yellow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="notifications" size={24} color={C.yellowDark} />
            <T style={{ fontWeight: '900', marginLeft: 8 }}>Perlu ditagih ({rem.length})</T>
          </View>
          {rem.map((d) => {
            const p = person(d.personId);
            return (
              <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Avatar nama={p.nama} size={44} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <T style={{ fontWeight: '800', fontSize: 16 }} numberOfLines={1}>{p.nama} · {rp(sisa(d))}</T>
                  <T style={{ fontSize: 14, fontWeight: '800', color: status(d).lewat ? C.red : C.yellowDark }}>{label(d)}</T>
                </View>
                <Pressable onPress={() => kirimWA(p, d)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', elevation: 3 }}>
                  <Ionicons name="logo-whatsapp" size={28} color="#fff" />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 }}>
        <Aksi label="Catat Hutang Baru" icon="create" bg={C.blue} fg="#fff" onPress={() => nav.push('DebtForm')} />
        <Aksi label="Catat Pembayaran" icon="cash" bg={C.yellow} fg={C.navy} onPress={() => nav.push('PayForm')} />
      </View>

      <T style={{ fontWeight: '900', fontSize: 20, margin: 16, marginBottom: 8 }}>Belum lunas terbaru</T>
      <View style={{ paddingHorizontal: 16 }}>
        {latest.length === 0 && (
          <Card style={{ alignItems: 'center', padding: 28 }}>
            <Ionicons name="document-text-outline" size={44} color={C.muted} />
            <T style={{ textAlign: 'center', marginTop: 8 }}>Belum ada catatan. Ketuk tombol + Catat untuk mulai.</T>
          </Card>
        )}
        {latest.map((d) => {
          const p = person(d.personId);
          const warna = d.jenis === 'piutang' ? C.green : C.red;
          return (
            <Card key={d.id} onPress={() => nav.push('Person', { id: p.id })} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderLeftWidth: 6, borderLeftColor: warna }}>
              <Avatar nama={p.nama} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <T style={{ fontWeight: '800' }} numberOfLines={1}>{p.nama}</T>
                <T style={{ fontSize: 14, color: C.muted }} numberOfLines={1}>{d.ket} · tempo {tgl(d.tempo)}</T>
                {status(d).lewat && <View style={{ flexDirection: 'row', marginTop: 4 }}><Chip label="LEWAT TEMPO" color={C.red} selected /></View>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T style={{ fontWeight: '900', color: warna }}>{rp(sisa(d))}</T>
                <T style={{ fontSize: 12, color: C.muted }}>{d.jenis === 'piutang' ? 'dia hutang' : 'saya hutang'}</T>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
  }
