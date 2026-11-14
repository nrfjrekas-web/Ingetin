// Nomor HP/WA selalu diperlakukan sebagai TEKS (string), tidak pernah diubah jadi angka,
// supaya tidak terpotong. Valid: diawali 08, total 10-13 digit.
export function nomorHP(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('62')) d = '0' + d.slice(2);
  return /^08\d{8,11}$/.test(d) ? d : null;
}
// Format untuk link wa.me: 085214736925 -> 6285214736925
export const nomorWA = (raw) => { const d = nomorHP(raw); return d ? '62' + d.slice(1) : null; };
