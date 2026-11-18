import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Btn, Card, Grad, Header, Page, T } from '../components/ui';
import { ADMIN_WA, APP, C } from '../core/theme';
import { bukaWA } from '../services/whatsapp';

const logo = require('../../assets/logo.png');
const VERSI = '1.1.0';

const FITUR = [
  ['book', 'Catat hutang dan piutang dengan cepat'],
  ['cash', 'Catat cicilan, sisa dan status lunas otomatis'],
  ['logo-whatsapp', 'Tagih lewat WhatsApp dengan satu ketukan'],
  ['notifications', 'Pengingat jatuh tempo setiap pagi'],
  ['stats-chart', 'Laporan bulanan dan kas harian'],
  ['cloud-done', 'Data tersimpan aman di cloud, tanpa iklan'],
];

const PRIVASI = [
  ['Data yang kami simpan', 'Nama, nomor HP, PIN (disimpan dalam bentuk terenkripsi sebagai sandi, tidak dapat dibaca), catatan hutang, pembayaran dan kas yang kamu buat, nomor WA orang yang kamu catat, serta kode notifikasi perangkat.'],
  ['Untuk apa', 'Menjalankan aplikasi, mengirim pengingat jatuh tempo, dan membantu kendala lewat Admin.'],
  ['Siapa yang bisa melihat', 'Hanya kamu yang bisa mengubah catatanmu. Admin aplikasi dapat melihat data akun untuk membantu kendala, tetapi tidak dapat mengubah catatanmu.'],
  ['Tidak dijual dan tanpa iklan', 'Data tidak dijual ke pihak lain dan aplikasi tidak menampilkan iklan.'],
  ['Hapus data', 'Kapan saja kamu bisa menghapus akun lewat Akun > Hapus Akun. Semua datamu ikut terhapus permanen.'],
];

export default function TentangScreen({ nav }) {
  const [buka, setBuka] = useState(-1);
  return (
    <Page>
      <Header title="Tentang Kami" onBack={nav.pop} />
      <Body>
        <Grad style={{ borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 14 }}>
          <Image source={logo} style={{ width: 84, height: 84, borderRadius: 22 }} />
          <T style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 2, marginTop: 8 }}>{APP}</T>
          <T style={{ color: '#DBEAFE' }}>Catatan All Transaksi</T>
          <T style={{ color: '#BFDBFE', fontSize: 13, marginTop: 4 }}>Versi {VERSI}</T>
        </Grad>
        <Card>
          <T style={{ fontWeight: '900', fontSize: 18, marginBottom: 6 }}>Tentang {APP}</T>
          <T style={{ fontSize: 15 }}>{APP} dibuat untuk membantu warga dusun, pemilik warung, dan bendahara mencatat bon, hutang-piutang, dan kas harian dengan mudah, jelas, dan tidak lupa menagih.</T>
        </Card>
        <Card>
          <T style={{ fontWeight: '900', fontSize: 18, marginBottom: 8 }}>Fitur utama</T>
          {FITUR.map(([ikon, teks]) => (
            <View key={teks} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
              <Ionicons name={ikon} size={20} color={C.blue} />
              <T style={{ fontSize: 15, marginLeft: 10, flex: 1 }}>{teks}</T>
            </View>
          ))}
        </Card>
        <T style={{ fontWeight: '900', fontSize: 18, marginVertical: 6 }}>Kebijakan Privasi</T>
        {PRIVASI.map(([judul, isi], i) => (
          <Card key={judul} onPress={() => setBuka(buka === i ? -1 : i)} style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <T style={{ flex: 1, fontWeight: '800', fontSize: 16 }}>{judul}</T>
              <Ionicons name={buka === i ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
            </View>
            {buka === i && <T style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>{isi}</T>}
          </Card>
        ))}
        <Btn color={C.green} icon="logo-whatsapp" label="Hubungi Kami via WhatsApp" onPress={() => bukaWA(ADMIN_WA, `Halo Admin ${APP}, `)} />
        <T style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>{APP} · Tanpa iklan · Versi {VERSI}</T>
      </Body>
    </Page>
  );
}
