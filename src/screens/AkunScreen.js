import React, { useEffect, useRef, useState } from 'react';
import { Alert, Clipboard, ImageBackground, Modal, Pressable, Share, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Avatar, Body, Btn, Card, Chip, Header, Input, Page, T } from '../components/ui';
import { APP, C, addDays, tgl, today } from '../core/theme';

const bannerImg = require('../../assets/banner-referral.png');

const MenuRow = ({ icon, title, sub, color = C.blue, onPress, right, last }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: '#F1F5F9',
      backgroundColor: pressed && onPress ? '#F8FAFC' : 'transparent',
    })}
  >
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <T style={{ fontWeight: '800', fontSize: 15 }}>{title}</T>
      {sub && <T style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</T>}
    </View>
    {right || <Ionicons name="chevron-forward" size={20} color={C.muted} />}
  </Pressable>
);

export default function AkunScreen({ nav }) {
  const {
    profile,
    nama,
    phone,
    kodeReferral,
    isAdmin,
    sync,
    logout,
    daftarDibuka,
    setDaftarDibuka,
    debts,
    persons,
  } = useStore();

  const [anggota, setAnggota] = useState([]);
  const [modalEdit, setModalEdit] = useState(false);
  const [namaBaru, setNamaBaru] = useState(nama);
  const [pinBaru, setPinBaru] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharingImg, setSharingImg] = useState(false);
  const posterRef = useRef(null);

  // Ambil kode dari store atau langsung dari profile.kode_referral
  const kodeRef = (kodeReferral || profile?.kode_referral || '').toUpperCase();

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id,nama,no_hp,dibuat,terakhir_aktif')
      .eq('diundang_oleh', profile.id)
      .order('dibuat', { ascending: false })
      .then((r) => setAnggota(r.data || []));
  }, []);

  const keluar = () =>
    Alert.alert('Keluar?', 'Anda bisa masuk lagi dengan No HP dan PIN.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);

  const salinKode = () => {
    if (!kodeRef) return;
    Clipboard.setString(kodeRef);
    Alert.alert('Tersalin', `Kode referral (${kodeRef}) berhasil disalin.`);
  };

  const undangDenganGambar = async () => {
    const pesan = `Yuk pakai ${APP}, aplikasi catatan all transaksi!\n\nMasukkan Kode Referral saya saat daftar:\n*${kodeRef}*`;
    Clipboard.setString(pesan);
    setSharingImg(true);
    try {
      const uri = await captureRef(posterRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Bagikan Kode Referral ${APP}`,
        });
      } else {
        await Share.share({ message: pesan });
      }
    } catch (e) {
      await Share.share({ message: pesan });
    } finally {
      setSharingImg(false);
    }
  };

  const simpanProfil = async () => {
    if (namaBaru.trim().length < 2) return Alert.alert('Gagal', 'Nama minimal 2 huruf.');
    if (pinBaru && !/^\d{6}$/.test(pinBaru)) return Alert.alert('Gagal', 'PIN baru harus 6 angka.');
    setSaving(true);
    try {
      const upd = await supabase.from('profiles').update({ nama: namaBaru.trim() }).eq('id', profile.id);
      if (upd.error) throw upd.error;
      if (pinBaru) {
        const authUpd = await supabase.auth.updateUser({ password: `${pinBaru}#ingetin` });
        if (authUpd.error) throw authUpd.error;
      }
      setSaving(false);
      setModalEdit(false);
      setPinBaru('');
      Alert.alert('Berhasil', 'Profil diperbarui. Tutup dan buka ulang aplikasi untuk melihat perubahan nama.');
    } catch (e) {
      setSaving(false);
      Alert.alert('Gagal', 'Tidak dapat menyimpan perubahan. Cek koneksi internet.');
    }
  };

  const toggleDaftar = async (val) => {
    setDaftarDibuka(val);
    await supabase.from('app_settings').update({ daftar_dibuka: val }).eq('id', 1);
  };

  return (
    <Page>
      <Header
        title="Akun"
        right={
          /* <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
            <Ionicons name={sync === 'ok' ? 'cloud-done' : 'cloud-offline'} size={15} color="#fff" />
            <T style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 5 }}>
              {sync === 'ok' ? 'Cloud Aktif' : 'Offline'}
            </T> 
          </View>*/
          null
        }
      />
      <Body>
        {/* Kartu Profil Utama */}
        <Card style={{ alignItems: 'center', padding: 20 }}>
          <Avatar nama={nama} size={80} />
          <T style={{ fontSize: 22, fontWeight: '900', marginTop: 10 }}>{nama}</T>
          <T style={{ color: C.muted, marginTop: 2 }}>{phone}</T>

          {isAdmin && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 }}>
              <Ionicons name="shield-checkmark" size={15} color="#7E22CE" />
              <T style={{ color: '#7E22CE', fontWeight: '900', fontSize: 12, marginLeft: 5 }}>ADMIN DEVELOPER</T>
            </View>
          )}

          {/* Ringkasan Singkat Data */}
          <View style={{ flexDirection: 'row', width: '100%', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <T style={{ fontSize: 18, fontWeight: '900', color: C.navy }}>{persons.length}</T>
              <T style={{ fontSize: 12, color: C.muted }}>Kontak</T>
            </View>
            <View style={{ width: 1, backgroundColor: '#E2E8F0' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <T style={{ fontSize: 18, fontWeight: '900', color: C.navy }}>{debts.length}</T>
              <T style={{ fontSize: 12, color: C.muted }}>Total Catatan</T>
            </View>
          </View>
        </Card>

        {/* Panel Khusus Admin Developer */}
        {isAdmin && (
          <View style={{ marginTop: 6 }}>
            <Btn color="#7C3AED" icon="shield-checkmark" label="MASUK DASHBOARD ADMIN" onPress={() => nav.push('AdminHome')} />
            <Card style={{ padding: 0, overflow: 'hidden', marginTop: 4 }}>
              <MenuRow
                icon="lock-open"
                color="#7C3AED"
                title="Pendaftaran Pengguna Baru"
                sub={daftarDibuka ? 'Terbuka untuk umum' : 'Ditutup sementara'}
                last
                right={<Switch value={daftarDibuka} onValueChange={toggleDaftar} trackColor={{ true: '#7C3AED' }} />}
              />
            </Card>
          </View>
        )}

        {/* Ajak Teman & Poster Kode Referral 6 Karakter */}
        <T style={{ fontWeight: '900', fontSize: 18, marginTop: 12, marginBottom: 8 }}>Ajak Teman Pakai {APP}</T>
        <Card style={{ padding: 12 }}>
          <View
            ref={posterRef}
            collapsable={false}
            style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, aspectRatio: 1.5, width: '100%' }}
          >
            <ImageBackground
              source={bannerImg}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            >
              <View
                style={{
                  position: 'absolute',
                  top: '39.8%',
                  left: '42.5%',
                  width: '48.5%',
                  height: '17%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <T
                  style={{
                    fontSize: 27,
                    fontWeight: '900',
                    color: '#1E3A8A',
                    letterSpacing: 4,
                    textAlign: 'center',
                  }}
                >
                  {kodeRef || '------'}
                </T>
              </View>
            </ImageBackground>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={salinKode}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DBEAFE', paddingVertical: 12, borderRadius: 12 }}
            >
              <Ionicons name="copy-outline" size={18} color={C.blue} />
              <T style={{ color: C.blue, fontWeight: '800', fontSize: 14, marginLeft: 6 }}>Salin Kode</T>
            </Pressable>

            <Pressable
              onPress={undangDenganGambar}
              disabled={sharingImg}
              style={{ flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, paddingVertical: 12, borderRadius: 12 }}
            >
              <Ionicons name="share-social" size={18} color="#fff" />
              <T style={{ color: '#fff', fontWeight: '800', fontSize: 14, marginLeft: 6 }}>
                {sharingImg ? 'Menyiapkan...' : 'Bagikan Poster & Kode'}
              </T>
            </Pressable>
          </View>
        </Card>

        {/* Daftar Anggota Yang Diundang */}
        <T style={{ fontWeight: '900', fontSize: 18, marginTop: 12, marginBottom: 6 }}>Anggota Yang Kamu Undang ({anggota.length})</T>
        {anggota.length === 0 && (
          <T style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>Kamu belum mengundang siapa-siapa.</T>
        )}
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

        {/* Pengaturan & Bantuan */}
        <T style={{ fontWeight: '900', fontSize: 18, marginTop: 12, marginBottom: 8 }}>Pengaturan & Bantuan</T>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <MenuRow
            icon="person-circle"
            color={C.blue}
            title="Edit Nama & Ganti PIN"
            sub="Ubah nama tampilan atau keamanan PIN 6 angka"
            onPress={() => { setNamaBaru(nama); setPinBaru(''); setModalEdit(true); }}
          />
          <MenuRow
            icon="flag"
            color="#D97706"
            title="Laporkan Masalah"
            sub="Kirim laporan kendala ke Admin"
            onPress={() => nav.push('Lapor')}
          />
          <MenuRow
            icon="log-out"
            color={C.red}
            title="Keluar"
            sub="Keluar dari akun di perangkat ini"
            onPress={keluar}
            last
          />
        </Card>

        <T style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 16 }}>
          {APP} · Tanpa iklan · v1.0.0
        </T>
      </Body>

      {/* Modal Edit Nama & PIN */}
      <Modal visible={modalEdit} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <T style={{ fontSize: 18, fontWeight: '900' }}>Edit Nama & Ganti PIN</T>
              <Pressable onPress={() => setModalEdit(false)}>
                <Ionicons name="close-circle" size={28} color={C.muted} />
              </Pressable>
            </View>
            <Input label="Nama lengkap" value={namaBaru} onChangeText={setNamaBaru} />
            <Input
              label="PIN baru 6 angka (kosongkan jika tidak ganti)"
              value={pinBaru}
              onChangeText={(v) => setPinBaru(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholder="******"
            />
            <Btn icon="checkmark-circle" label={saving ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={simpanProfil} disabled={saving} />
          </View>
        </View>
      </Modal>
    </Page>
  );
}
