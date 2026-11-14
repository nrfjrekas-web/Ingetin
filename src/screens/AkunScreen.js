import React, { useEffect, useState } from 'react';
import { Alert, Share, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Avatar, Body, Btn, Card, Chip, Header, Page, T } from '../components/ui';
import { APP, C, addDays, tgl, today } from '../core/theme';

export default function AkunScreen({ nav }) {
  const { profile, nama, phone, isAdmin, logout } = useStore();
  const [anggota, setAnggota] = useState([]);
  useEffect(() => {
    supabase.from('profiles').select('id,nama,no_hp,dibuat,terakhir_aktif').eq('diundang_oleh', profile.id).order('dibuat', { ascending: false })
      .then((r) => setAnggota(r.data || []));
  }, []);
  const keluar = () => Alert.alert('Keluar?', 'Anda bisa masuk lagi dengan No HP dan PIN.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Keluar', onPress: logout }]);
  const undang = () => Share.share({ message: `Yuk pakai ${APP}, aplikasi catatan bon, kas & hutang dusun. Saat daftar, isi Kode Undangan: ${phone}` });
  return (
    <Page>
      <Header title="Akun" />
      <Body>
        <Card style={{ alignItems: 'center', padding: 24 }}>
          <Avatar nama={nama} size={84} />
          <T style={{ fontSize: 22, fontWeight: '900', marginTop: 10 }}>{nama}</T>
          <T style={{ color: C.muted }}>{phone}</T>
        </Card>
        {isAdmin && <Btn color="#7C3AED" icon="shield-checkmark" label="MASUK DASHBOARD ADMIN" onPress={() => nav.push('AdminHome')} />}
        <T style={{ fontWeight: '900', fontSize: 20, marginVertical: 8 }}>Anggota Yang Kamu Undang ({anggota.length})</T>
        {anggota.length === 0 && <T style={{ fontSize: 16, color: C.muted, marginBottom: 10 }}>Kamu belum mengundang siapa-siapa.</T>}
        {anggota.map((m) => {
          const aktif = new Date(m.terakhir_aktif) > addDays(today(), -7);
          return (
            <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <T style={{ fontWeight: '800' }}>{m.nama}</T>
                <T style={{ fontSize: 14, color: C.muted }}>{m.no_hp} · diundang {tgl(m.dibuat)}</T>
              </View>
              <Chip label={aktif ? 'Aktif' : 'Belum Aktif'} color={aktif ? C.green : C.muted} selected />
            </Card>
          );
        })}
        <Btn outline icon="person-add" label="Undang Anggota Baru" onPress={undang} />
        <Btn outline icon="flag" label="Laporkan Masalah" onPress={() => nav.push('Lapor')} />
        <Btn outline color={C.red} icon="log-out" label="Keluar" onPress={keluar} />
        <T style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 12 }}>{APP} · Tanpa iklan</T>
      </Body>
    </Page>
  );
}
