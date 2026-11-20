import { Alert, Linking } from 'react-native';
import { APP, dayDiff, rp, sisa, today } from '../core/theme';
import { nomorWA } from '../core/phone';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tglPanjang = (d) => { const x = new Date(d); return `${x.getDate()} ${BULAN[x.getMonth()]} ${x.getFullYear()}`; };

export async function bukaWA(nomor, pesan) {
  const n = nomorWA(nomor);
  if (!n) return Alert.alert('Nomor WA kurang, cek lagi', 'No WA harus diawali 08 dan 10-13 digit.');
  try {
    await Linking.openURL(`https://wa.me/${n}?text=${encodeURIComponent(pesan)}`);
  } catch (e) {
    Alert.alert('WhatsApp tidak bisa dibuka', 'Pastikan WhatsApp sudah terpasang.');
  }
}

// Isi pesan tagihan WhatsApp diatur di sini. Kata-katanya menyesuaikan: akan jatuh tempo / hari ini / sudah lewat.
export function pesanTagihan(person, debt) {
  const selisih = dayDiff(debt.tempo, today());
  const jumlah = rp(sisa(debt)).replace('Rp ', 'Rp');
  const tanggal = tglPanjang(debt.tempo);
  const kapan = selisih > 0 ? `akan jatuh tempo pada tanggal *${tanggal}*`
    : selisih === 0 ? `jatuh tempo hari ini, tanggal *${tanggal}*`
    : `telah jatuh tempo pada tanggal *${tanggal}*`;
  const mohon = selisih >= 0
    ? 'Mohon kesediaannya untuk melakukan pembayaran tepat waktu, ya.'
    : 'Mohon kesediaannya untuk segera melakukan pembayaran, ya.';
  return `Halo *${person.nama}* 😊\n\n`
    + `Kami ingin mengingatkan bahwa tagihan/utang Anda sebesar *${jumlah}* ${kapan}.\n\n`
    + `${mohon}\n\n`
    + 'Terima kasih atas perhatian dan kerja samanya.\n\n'
    + `Salam,\n*${APP} – Catatan All Transaksi* 🔔`;
}

export const kirimWA = (person, debt) => bukaWA(person.wa, pesanTagihan(person, debt));
