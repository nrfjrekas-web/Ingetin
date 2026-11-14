export const APP = 'INGETIN';
export const ADMIN_WA = '089601793889';
export const C = { green: '#16A34A', red: '#DC2626', blue: '#2563EB', bg: '#F6F7F9', text: '#111827', muted: '#6B7280', yellow: '#FACC15', yellowDark: '#A16207', yellowBg: '#FEF9C3', navy: '#0B2A6F', line: '#D1D5DB' };
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const rp = (n) => 'Rp ' + Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const tgl = (d) => { const x = new Date(d); return `${x.getDate()} ${BLN[x.getMonth()]} ${x.getFullYear()}`; };
export const dayDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

// Aturan hutang: sisa dan status dihitung dari data, tidak disimpan.
export const sisa = (d) => d.awal - d.pays.reduce((a, p) => a + p.jumlah, 0);
export function status(d) {
  if (sisa(d) <= 0) return { label: 'LUNAS', color: C.green, lunas: true };
  if (new Date(d.tempo) < today()) return { label: 'LEWAT TEMPO', color: C.red, lewat: true };
  return { label: 'BELUM LUNAS', color: C.blue };
}

// Dipanggil setiap render, jadi Sisa Kas selalu ikut berubah saat ada hutang/pembayaran ditambah, diubah, atau dihapus.
// Sisa Kas Bulan Ini = pembayaran piutang yang masuk - pembayaran hutang yang keluar (bulan ini).
export function hitungUlangSisaKas(debts, now = today()) {
  let masuk = 0, keluar = 0;
  debts.forEach((d) => d.pays.forEach((p) => {
    const x = new Date(p.tgl);
    if (x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth()) {
      if (d.jenis === 'piutang') masuk += p.jumlah; else keluar += p.jumlah;
    }
  }));
  return { masuk, keluar, sisa: masuk - keluar };
}
export const jam = (d) => { const x = new Date(d); const p = (n) => String(n).padStart(2, '0'); return `${tgl(x)} ${p(x.getHours())}:${p(x.getMinutes())}`; };
