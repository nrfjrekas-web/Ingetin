import { addDays, today } from '../core/theme';

// Data contoh akun demo: 5 orang, 8 catatan hutang.
export function buildSeed() {
  const d = (n) => addDays(today(), n).toISOString();
  const pay = (jumlah, n, ket = '') => ({ jumlah, tgl: d(n), ket });
  const debt = (id, personId, jenis, awal, ket, pinjam, tempo, pays = []) =>
    ({ id, personId, jenis, awal, ket, pinjam: d(pinjam), tempo: d(tempo), pays });
  return {
    persons: [
      { id: 'p1', nama: 'Budi Santoso', wa: '081234500001' },
      { id: 'p2', nama: 'Siti Aminah', wa: '081234500002' },
      { id: 'p3', nama: 'Agus Prasetyo', wa: '081234500003' },
      { id: 'p4', nama: 'Dewi Lestari', wa: '081234500004' },
      { id: 'p5', nama: 'Pak Haji Rahmat', wa: '081234500005' },
    ],
    debts: [
      debt('d1', 'p1', 'piutang', 150000, 'Bon Beras', -20, 10, [pay(50000, -8, 'Cicil 1')]),
      debt('d2', 'p2', 'piutang', 300000, 'Bon Pakan Ikan', -30, -5, [pay(100000, -15, 'Cicil 1')]),
      debt('d3', 'p3', 'piutang', 500000, 'Pinjam Modal', -10, 3),
      debt('d4', 'p4', 'piutang', 75000, 'Bon Warung', -25, -10, [pay(50000, -18), pay(25000, -10, 'Lunas')]),
      debt('d5', 'p5', 'hutang', 1000000, 'Pinjam Modal Usaha', -40, 20, [pay(400000, -12, 'Cicil 1')]),
      debt('d6', 'p1', 'hutang', 50000, 'Beli Pulsa Dulu', -7, 0),
      debt('d7', 'p2', 'piutang', 60000, 'Bon Gula & Kopi', -4, 15, [pay(20000, -1)]),
      debt('d8', 'p3', 'hutang', 200000, 'Patungan Kas', -30, -3, [pay(120000, -14), pay(80000, -4, 'Lunas')]),
    ],
  };
}
