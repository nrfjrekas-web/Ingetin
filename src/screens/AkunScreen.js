import React, { useEffect, useRef, useState } from 'react';
import { Alert, ImageBackground, Modal, Pressable, Share, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../services/supabase';
import { aksiAdmin } from '../services/admin';
import { useStore } from '../store/store';
import { Body, Btn, Card, Chip, Grad, Header, Input, Page, T } from '../components/ui';
import { APP, C, addDays, tgl, today } from '../core/theme';

const bannerImg = require('../../assets/banner-referral.jpg');

// Satu baris menu dengan ikon berwarna.
const MenuRow = ({ icon, title, color = C.blue, onPress, right, last }) => (
  <Pressable onPress={onPress}
    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#F1F5F9', backgroundColor: pressed && onPress ? '#F8FAFC' : 'transparent' })}>
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '1A', alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <T style={{ flex: 1, marginLeft: 12, fontWeight: '800', fontSize: 16, color: color === C.red ? C.red : C.text }}>{title}</T>
    {right || <Ionicons name="chevron-forward" size={20} color={C.muted} />}
  </Pressable>
);

// Kotak statistik kecil di kartu profil.
const Stat = ({ icon, angka, label }) => (
  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', paddingVertical: 8, paddingHorizontal: 10 }}>
    <Ionicons name={icon} size={22} color={C.blue} />
    <View style={{ marginLeft: 8 }}>
      <T style={{ fontSize: 17, fontWeight: '900', color: C.navy, lineHeight: 20 }}>{angka}</T>
      <T style={{ fontSize: 12, color: C.muted }}>{label}</T>
    </View>
  </View>
);

// Poster kode referral (dipakai untuk pratinjau dan untuk gambar yang dibagikan).
const Poster = ({ kode, innerRef, skala = 1 }) => (
  <View ref={innerRef} collapsable={false} style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: 1.5, width: '100%' }}>
    <ImageBackground source={bannerImg} style={{ width: '100%', height: '100%' }} resizeMode="cover">
      <View style={{ position: 'absolute', top: '39.8%', left: '42.5%', width: '48.5%', height: '17%', justifyContent: 'center', alignItems: 'center' }}>
        <T style={{ fontSize: 27 * skala, fontWeight: '900', color: '#1E3A8A', letterSpacing: 4 * skala, textAlign: 'center' }}>{kode || '------'}</T>
      </View>
    </ImageBackground>
  </View>
);

// Lembar yang naik dari bawah.
const Sheet = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <T style={{ fontSize: 18, fontWeight: '900', flex: 1 }}>{title}</T>
          <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close-circle" size={28} color={C.muted} /></Pressable>
        </View>
        {children}
      </View>
    </View>
  </Modal>
);

export default function AkunScreen({ nav }) {
  const { profile, nama, phone, kodeReferral, isAdmin, logout, daftarDibuka, setDaftarDibuka, debts, persons } = useStore();
  const [anggota, setAnggota] = useState([]);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalPoster, setModalPoster] = useState(false);
  const [modalAnggota, setModalAnggota] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [namaBaru, setNamaBaru] = useState(nama);
  const [pinBaru, setPinBaru] = useState('');
  const [pinHapus, setPinHapus] = useState('');
  const [saving, setSaving] = useState(false);
  const [menghapus, setMenghapus] = useState(false);
  const [sharingImg, setSharingImg] = useState(false);
  const posterRef = useRef(null);
  const kodeRef = (kodeReferral || (profile && profile.kode_referral) || '').toUpperCase();

  useEffect(() => {
    supabase.from('profiles').select('id,nama,no_hp,dibuat,terakhir_aktif').eq('diundang_oleh', profile.id)
      .order('dibuat', { ascending: false }).then((r) => setAnggota(r.data || []));
  }, []);

  const keluar = () => Alert.alert('Keluar?', 'Anda bisa masuk lagi dengan No HP dan PIN.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Keluar', style: 'destructive', onPress: logout }]);

  const salinKode = () => {
    if (!kodeRef) return;
    Clipboard.setStringAsync(kodeRef);
    Alert.alert('Tersalin', `Kode referral (${kodeRef}) berhasil disalin.`);
  };

  const bagikan = async () => {
    const pesan = `Yuk pakai ${APP}, aplikasi catatan all transaksi!\n\nMasukkan Kode Referral saya saat daftar:\n*${kodeRef}*`;
    setSharingImg(true);
    try {
      const uri = await captureRef(posterRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Bagikan Kode Referral ${APP}` });
      else await Share.share({ message: pesan });
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
        const a = await supabase.auth.updateUser({ password: `${pinBaru}#ingetin` });
        if (a.error) throw a.error;
      }
      setSaving(false); setModalEdit(false); setPinBaru('');
      Alert.alert('Berhasil', 'Profil diperbarui. Tutup dan buka ulang aplikasi untuk melihat perubahan nama.');
    } catch (e) {
      setSaving(false);
      Alert.alert('Gagal', 'Tidak dapat menyimpan perubahan. Cek koneksi internet.');
    }
  };

  const hapusAkun = async () => {
    if (!/^\d{6}$/.test(pinHapus)) return Alert.alert('Gagal', 'Masukkan PIN 6 angka.');
    setMenghapus(true);
    const r = await aksiAdmin({ aksi: 'hapus_akun_saya', pin: pinHapus });
    setMenghapus(false);
    if (r.error) return Alert.alert('Gagal', r.error);
    setModalHapus(false); setPinHapus('');
    Alert.alert('Akun dihapus', 'Akun dan semua datanya sudah dihapus.');
    logout();
  };

  const toggleDaftar = async (val) => {
    setDaftarDibuka(val);
    await supabase.from('app_settings').update({ daftar_dibuka: val }).eq('id', 1);
  };

  return (
    <Page>
      <Header title="Akun" />
      <Body>
        {/* Profil: avatar kiri, nama + nomor kanan, dua kotak statistik */}
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Grad colors={['#2563EB', '#38BDF8']} style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', elevation: 4 }}>
              <T style={{ color: '#fff', fontSize: 36, fontWeight: '900' }}>{(nama || '?')[0].toUpperCase()}</T>
            </Grad>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <T style={{ fontSize: 22, fontWeight: '900' }} numberOfLines={1}>{nama}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="call" size={15} color={C.muted} />
                <T style={{ color: C.muted, fontSize: 15, marginLeft: 5 }}>{phone}</T>
              </View>
              {isAdmin && (
                <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 6 }}>
                  <Ionicons name="shield-checkmark" size={14} color="#7E22CE" />
                  <T style={{ color: '#7E22CE', fontWeight: '900', fontSize: 11, marginLeft: 4 }}>ADMIN DEVELOPER</T>
                </View>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Stat icon="people" angka={persons.length} label="Kontak" />
            <Stat icon="document-text" angka={debts.length} label="Total Catatan" />
          </View>
        </Card>

        {/* Kartu referral kecil */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.yellowBg, borderRadius: 16, borderWidth: 1.5, borderColor: C.yellow, padding: 12, marginBottom: 12 }}>
          <Pressable onPress={() => setModalPoster(true)} hitSlop={8} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.yellow + '66', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="gift" size={22} color={C.yellowDark} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <T style={{ fontWeight: '900', fontSize: 16 }}>Kode Kamu: {kodeRef || '------'}</T>
            <T style={{ fontSize: 12, color: C.muted }}>Ajak teman pakai {APP}</T>
          </View>
          <Pressable onPress={salinKode} style={{ paddingHorizontal: 12, minHeight: 40, justifyContent: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: C.blue, backgroundColor: '#fff', marginRight: 6 }}>
            <T style={{ color: C.blue, fontWeight: '800', fontSize: 14 }}>Salin</T>
          </Pressable>
          <Pressable onPress={bagikan} disabled={sharingImg} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 40, borderRadius: 10, backgroundColor: C.blue, opacity: sharingImg ? 0.6 : 1 }}>
            <Ionicons name="share-social" size={16} color="#fff" />
            <T style={{ color: '#fff', fontWeight: '800', fontSize: 14, marginLeft: 5 }}>{sharingImg ? '...' : 'Bagikan'}</T>
          </Pressable>
        </View>

        {/* Panel admin */}
        {isAdmin && (
          <>
            <Btn color="#7C3AED" icon="shield-checkmark" label="MASUK DASHBOARD ADMIN" onPress={() => nav.push('AdminHome')} />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <MenuRow icon="lock-open" color="#7C3AED" title={daftarDibuka ? 'Pendaftaran: Terbuka' : 'Pendaftaran: Ditutup'} last
                right={<Switch value={daftarDibuka} onValueChange={toggleDaftar} trackColor={{ true: '#7C3AED' }} />} />
            </Card>
          </>
        )}

        <T style={{ fontWeight: '900', fontSize: 18, marginBottom: 8 }}>Pengaturan & Bantuan</T>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <MenuRow icon="person-circle" color={C.blue} title="Edit Nama & Ganti PIN" onPress={() => { setNamaBaru(nama); setPinBaru(''); setModalEdit(true); }} />
          <MenuRow icon="people-circle" color={C.green} title={`Anggota yang Diundang (${anggota.length})`} onPress={() => setModalAnggota(true)} />
          <MenuRow icon="flag" color="#D97706" title="Laporkan Masalah" onPress={() => nav.push('Lapor')} />
          <MenuRow icon="help-circle" color="#7C3AED" title="Pusat Bantuan" onPress={() => nav.push('Bantuan')} />
          <MenuRow icon="trash" color={C.red} title="Hapus Akun" onPress={() => { setPinHapus(''); setModalHapus(true); }} last />
        </Card>

        <Btn color={C.red} icon="log-out" label="Keluar" onPress={keluar} />
        <T style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>{APP} · Tanpa iklan · v1.1.0</T>
      </Body>

      {/* Poster tersembunyi di luar layar: dipakai untuk membuat gambar yang dibagikan */}
      <View pointerEvents="none" style={{ position: 'absolute', left: -3000, top: 0, width: 640 }}>
        <Poster kode={kodeRef} innerRef={posterRef} skala={1.9} />
      </View>

      <Modal visible={modalPoster} transparent animationType="fade" onRequestClose={() => setModalPoster(false)}>
        <Pressable onPress={() => setModalPoster(false)} style={{ flex: 1, backgroundColor: '#000000CC', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Poster kode={kodeRef} />
          <T style={{ color: '#fff', fontSize: 13, marginTop: 12 }}>Ketuk mana saja untuk tutup</T>
        </Pressable>
      </Modal>

      <Sheet visible={modalEdit} onClose={() => setModalEdit(false)} title="Edit Nama & Ganti PIN">
        <Input label="Nama lengkap" value={namaBaru} onChangeText={setNamaBaru} />
        <Input label="PIN baru 6 angka (kosongkan jika tidak ganti)" value={pinBaru} onChangeText={(v) => setPinBaru(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="******" />
        <Btn icon="checkmark-circle" label={saving ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={simpanProfil} disabled={saving} />
      </Sheet>

      <Sheet visible={modalAnggota} onClose={() => setModalAnggota(false)} title={`Anggota yang Diundang (${anggota.length})`}>
        {anggota.length === 0 && <T style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>Kamu belum mengundang siapa-siapa. Bagikan kode referralmu.</T>}
        {anggota.map((m) => {
          const aktif = new Date(m.terakhir_aktif) > addDays(today(), -7);
          return (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
              <View style={{ flex: 1 }}>
                <T style={{ fontWeight: '800' }}>{m.nama}</T>
                <T style={{ fontSize: 13, color: C.muted }}>{m.no_hp} · diundang {tgl(m.dibuat)}</T>
              </View>
              <Chip label={aktif ? 'Aktif' : 'Belum Aktif'} color={aktif ? C.green : C.muted} selected />
            </View>
          );
        })}
      </Sheet>

      <Sheet visible={modalHapus} onClose={() => setModalHapus(false)} title="Hapus Akun">
        <T style={{ fontSize: 15, marginBottom: 12 }}>Akun dan SEMUA datamu (hutang, pembayaran, kas, notifikasi) akan dihapus permanen dan tidak bisa dikembalikan.</T>
        <Input label="Masukkan PIN untuk konfirmasi" value={pinHapus} onChangeText={(v) => setPinHapus(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="******" />
        <Btn color={C.red} icon="trash" label={menghapus ? 'Menghapus...' : 'Hapus Akun Saya'} onPress={hapusAkun} disabled={menghapus} />
      </Sheet>
    </Page>
  );
}
