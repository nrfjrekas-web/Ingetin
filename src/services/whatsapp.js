import { Alert, Linking } from 'react-native';
import { APP, rp, sisa, tgl } from '../core/theme';
import { nomorWA } from '../core/phone';

export async function bukaWA(nomor, pesan) {
  const n = nomorWA(nomor);
  if (!n) return Alert.alert('Nomor WA kurang, cek lagi', 'No WA harus diawali 08 dan 10-13 digit.');
  try {
    await Linking.openURL(`https://wa.me/${n}?text=${encodeURIComponent(pesan)}`);
  } catch (e) {
    Alert.alert('WhatsApp tidak bisa dibuka', 'Pastikan WhatsApp sudah terpasang.');
  }
}

// Isi pesan pengingat WA diatur di sini.
export const kirimWA = (person, debt) =>
  bukaWA(person.wa, `Halo ${person.nama}, hutang ${rp(sisa(debt))} jatuh tempo tanggal ${tgl(debt.tempo)}, mohon dibayar ya. Terima kasih - ${APP}`);
