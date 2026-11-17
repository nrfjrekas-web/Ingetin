import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Btn, Card, Header, Page, T } from '../components/ui';
import { ADMIN_WA, APP, C } from '../core/theme';
import { bukaWA } from '../services/whatsapp';
import { useStore } from '../store/store';

const FAQ = [
  ['Bagaimana mencatat hutang baru?', 'Ketuk tombol kuning + Catat di menu bawah, pilih jenisnya (dia hutang ke saya atau saya hutang), isi nama, jumlah, dan tanggal jatuh tempo, lalu Simpan.'],
  ['Bagaimana mencatat pembayaran atau cicilan?', 'Ketuk Bayar di menu bawah, pilih hutangnya, isi jumlah bayar, lalu Simpan. Sisa hutang otomatis berkurang, dan status berubah LUNAS kalau sisanya nol.'],
  ['Bagaimana menagih lewat WhatsApp?', 'Buka detail orang atau kotak "Perlu ditagih" di Beranda, lalu ketuk tombol WhatsApp. Pesan tagihan sudah terisi otomatis. Pastikan No WA orang itu sudah diisi.'],
  ['Kapan pengingat jatuh tempo muncul?', 'Setiap pagi sekitar jam 07:00 untuk hutang yang jatuh tempo 3 hari lagi, besok, hari ini, atau sudah lewat. Pengingat juga tersimpan di ikon lonceng di Beranda.'],
  ['Lupa PIN, bagaimana?', 'Di layar Masuk, isi No HP lalu ketuk "Lupa PIN?". Admin akan mengatur ulang PIN dan mengirim PIN barunya lewat WhatsApp.'],
  ['Apakah data saya aman?', `Data tersimpan di server dan terhubung ke akunmu. Admin ${APP} dapat melihat data untuk membantu kendala, tetapi tidak dapat mengubah catatanmu.`],
  ['Ganti HP, apakah data hilang?', 'Tidak. Masuk dengan No HP dan PIN yang sama di HP baru, semua catatan kembali.'],
];

export default function BantuanScreen({ nav }) {
  const { phone, nama } = useStore();
  const [buka, setBuka] = useState(0);
  return (
    <Page>
      <Header title="Pusat Bantuan" onBack={nav.pop} />
      <Body>
        {FAQ.map(([tanya, jawab], i) => (
          <Card key={tanya} onPress={() => setBuka(buka === i ? -1 : i)} style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <T style={{ flex: 1, fontWeight: '800', fontSize: 16 }}>{tanya}</T>
              <Ionicons name={buka === i ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
            </View>
            {buka === i && <T style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>{jawab}</T>}
          </Card>
        ))}
        <Btn color={C.green} icon="logo-whatsapp" label="Hubungi Admin via WhatsApp"
          onPress={() => bukaWA(ADMIN_WA, `Halo Admin, saya ${nama} (${phone}) butuh bantuan ${APP}: `)} />
      </Body>
    </Page>
  );
}
