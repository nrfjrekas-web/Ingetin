import { Alert, Linking } from 'react-native';
import { APP, rp, sisa, tgl } from '../core/theme';

// Isi pesan pengingat WA diatur di sini.
export async function kirimWA(person, debt) {
  let n = (person.wa || '').replace(/\D/g, '');
  if (!n) return Alert.alert('Nomor WA belum diisi', `Isi nomor WA ${person.nama} lewat Catat Hutang Baru.`);
  if (n.startsWith('0')) n = '62' + n.slice(1);
  const msg = `Halo ${person.nama}, hutang ${rp(sisa(debt))} jatuh tempo tanggal ${tgl(debt.tempo)}, mohon dibayar ya. Terima kasih - ${APP}`;
  try {
    await Linking.openURL(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`);
  } catch (e) {
    Alert.alert('WhatsApp tidak bisa dibuka', 'Pastikan WhatsApp sudah terpasang.');
  }
}
