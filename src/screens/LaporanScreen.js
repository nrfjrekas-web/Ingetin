import React, { useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Body, Btn, Card, Header, Page, T } from '../components/ui';
import { C, hitungUlangSisaKas, rp, sisa, tgl } from '../core/theme';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const sama = (t, ref) => { const x = new Date(t); return x.getFullYear() === ref.getFullYear() && x.getMonth() === ref.getMonth(); };

export default function LaporanScreen({ nav }) {
  const { debts, kas, person } = useStore();
  const [off, setOff] = useState(0);
  const n = new Date();
  const bulanKe = (i) => new Date(n.getFullYear(), n.getMonth() + i, 1);
  const ref = bulanKe(off);
  const r = hitungUlangSisaKas(debts, kas, ref);
  const baru = (j) => debts.filter((d) => d.jenis === j && sama(d.pinjam, ref)).reduce((a, d) => a + d.awal, 0);
  const lunas = debts.filter((d) => sisa(d) <= 0 && d.pays.length && sama(d.pays[d.pays.length - 1].tgl, ref)).length;
  const judul = `${BULAN[ref.getMonth()]} ${ref.getFullYear()}`;

  // Grafik 6 bulan terakhir: uang masuk (hijau) vs uang keluar (merah), digambar dari View biasa (ringan).
  const enam = [-5, -4, -3, -2, -1, 0].map((i) => ({ b: bulanKe(i), h: hitungUlangSisaKas(debts, kas, bulanKe(i)) }));
  const maks = Math.max(1, ...enam.map((x) => Math.max(x.h.masuk, x.h.keluar)));

  const ekspor = () => {
    const baris = [['Tanggal', 'Jenis', 'Nama', 'Keterangan', 'Jumlah']];
    debts.forEach((d) => d.pays.forEach((p) => {
      if (sama(p.tgl, ref)) baris.push([tgl(p.tgl), d.jenis === 'piutang' ? 'Uang masuk (bayar piutang)' : 'Uang keluar (bayar hutang)', person(d.personId).nama, d.ket, p.jumlah]);
    }));
    kas.forEach((k) => { if (sama(k.tgl, ref)) baris.push([tgl(k.tgl), k.tipe === 'masuk' ? 'Kas masuk' : 'Kas keluar', '', k.ket, k.jumlah]); });
    baris.push([], ['Total uang masuk', '', '', '', r.masuk], ['Total uang keluar', '', '', '', r.keluar], ['Sisa kas', '', '', '', r.sisa]);
    const csv = baris.map((b) => b.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    Share.share({ title: `Laporan INGETIN ${judul}`, message: `Laporan INGETIN ${judul}\n\n${csv}` });
  };

  const Baris = ({ label, nilai, warna }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <T style={{ fontSize: 16 }}>{label}</T><T style={{ fontSize: 16, fontWeight: '900', color: warna || C.text }}>{nilai}</T>
    </View>
  );
  return (
    <Page>
      <Header title="Laporan Bulanan" onBack={nav.pop} />
      <Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Pressable onPress={() => setOff(off - 1)} hitSlop={10} style={{ padding: 10 }}><Ionicons name="chevron-back" size={28} color={C.blue} /></Pressable>
          <T style={{ fontWeight: '900', fontSize: 22 }}>{judul}</T>
          <Pressable onPress={() => off < 0 && setOff(off + 1)} hitSlop={10} style={{ padding: 10, opacity: off < 0 ? 1 : 0.3 }}><Ionicons name="chevron-forward" size={28} color={C.blue} /></Pressable>
        </View>
        <Card>
          <Baris label="Uang masuk" nilai={rp(r.masuk)} warna={C.green} />
          <Baris label="Uang keluar" nilai={rp(r.keluar)} warna={C.red} />
          <Baris label="Sisa kas" nilai={(r.sisa < 0 ? '-' : '') + rp(r.sisa)} warna={C.blue} />
        </Card>
        <Card>
          <Baris label="Piutang baru dicatat" nilai={rp(baru('piutang'))} />
          <Baris label="Hutang baru dicatat" nilai={rp(baru('hutang'))} />
          <Baris label="Catatan yang lunas" nilai={String(lunas)} warna={C.green} />
        </Card>
        <Card>
          <T style={{ fontWeight: '800', marginBottom: 8 }}>Uang masuk vs keluar, 6 bulan</T>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
            {enam.map((x) => (
              <View key={x.b.getMonth()} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
                  <View style={{ width: 14, height: 4 + (90 * x.h.masuk) / maks, backgroundColor: C.green, borderRadius: 4 }} />
                  <View style={{ width: 14, height: 4 + (90 * x.h.keluar) / maks, backgroundColor: C.red, borderRadius: 4 }} />
                </View>
                <T style={{ fontSize: 11, color: C.muted }}>{BULAN[x.b.getMonth()].slice(0, 3)}</T>
              </View>
            ))}
          </View>
        </Card>
        <Btn icon="share-social" label="Bagikan / Export (CSV)" onPress={ekspor} />
        <T style={{ fontSize: 13, color: C.muted }}>Hasil berupa teks CSV: kirim ke WhatsApp/email, atau tempel ke Excel / Google Sheets.</T>
      </Body>
    </Page>
  );
}
