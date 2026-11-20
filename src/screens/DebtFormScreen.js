import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store/store';
import { Body, Btn, Chip, DateField, Err, Header, Input, Page, UangInput } from '../components/ui';
import { C, addDays, sisa, today } from '../core/theme';
import { nomorWA } from '../core/phone';

// Dipakai untuk Catat Hutang Baru (tanpa debtId) dan Edit Hutang (dengan debtId).
export default function DebtFormScreen({ nav, debtId }) {
  const { persons, debts, person, addDebt, updateDebt } = useStore();
  const d = debtId ? debts.find((x) => x.id === debtId) : null;
  const p0 = d ? person(d.personId) : null;
  const [jenis, setJenis] = useState(d ? d.jenis : 'piutang');
  const [nama, setNama] = useState(p0 ? p0.nama : '');
  const [wa, setWa] = useState(p0 ? p0.wa : '');
  const [jumlah, setJumlah] = useState(d ? String(d.awal) : '');
  const [ket, setKet] = useState(d ? d.ket : '');
  const [pinjam, setPinjam] = useState(d ? new Date(d.pinjam) : today());
  const [tempo, setTempo] = useState(d ? new Date(d.tempo) : addDays(today(), 7));
  const [err, setErr] = useState(null);

  const simpan = () => {
    const j = parseInt(jumlah || '0', 10);
    if (!nama.trim()) return setErr('Nama orang wajib diisi.');
    if (wa.trim() && !nomorWA(wa)) return setErr('Nomor WA kurang, cek lagi (diawali 08, 10-13 digit).');
    if (j <= 0) return setErr('Jumlah harus lebih dari 0.');
    if (d && j < d.awal - sisa(d)) return setErr('Jumlah tidak boleh lebih kecil dari yang sudah dibayar.');
    if (tempo < pinjam) return setErr('Jatuh tempo tidak boleh sebelum tanggal pinjam.');
    const f = { nama: nama.trim(), wa: wa.trim(), jenis, jumlah: j, ket: ket.trim(), pinjam, tempo };
    if (d) updateDebt(d.id, f); else addDebt(f);
    nav.pop();
  };
  return (
    <Page>
      <Header title={d ? 'Edit Hutang' : 'Catat Hutang Baru'} onBack={nav.pop} />
      <Body>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Chip label="Dia hutang ke saya" color={C.green} selected={jenis === 'piutang'} onPress={() => setJenis('piutang')} />
          <Chip label="Saya hutang" color={C.red} selected={jenis === 'hutang'} onPress={() => setJenis('hutang')} />
        </View>
        <Input label="Nama orang" value={nama} onChangeText={setNama} />
        <Input label="No WA (boleh kosong)" value={wa} onChangeText={(v) => setWa(v.replace(/\D/g, ''))} keyboardType="phone-pad" maxLength={14} placeholder="08xxxxxxxxxx" />
        <UangInput label="Jumlah" value={jumlah} onChange={setJumlah} />
        <Input label="Keterangan (contoh: Bon Beras)" value={ket} onChangeText={setKet} />
        <DateField label="Tanggal pinjam" value={pinjam} onChange={setPinjam} />
        <DateField label="Jatuh tempo" value={tempo} onChange={setTempo} />
        <Err>{err}</Err>
        <Btn icon="checkmark" label={d ? 'Simpan Perubahan' : 'Simpan'} onPress={simpan} />
      </Body>
    </Page>
  );
}
