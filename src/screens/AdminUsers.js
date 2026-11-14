import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useStore } from '../store/store';
import { Avatar, Body, Card, Chip, Header, Page, T } from '../components/ui';
import { C, addDays, jam, tgl, today } from '../core/theme';

const FILTER = ['Semua', 'Aktif Hari Ini', 'Baru Daftar', 'Tidak Aktif 7 Hari'];

export default function AdminUsers({ nav }) {
  const { phone, nama } = useStore();
  const [list, setList] = useState([]);
  const [jml, setJml] = useState({});
  const [q, setQ] = useState('');
  const [f, setF] = useState('Semua');
  useEffect(() => {
    (async () => {
      const u = await supabase.from('profiles').select('*').eq('role', 'user').order('dibuat', { ascending: false });
      setList(u.data || []);
      const d = await supabase.from('debts').select('user_id');
      const c = {};
      (d.data || []).forEach((r) => { c[r.user_id] = (c[r.user_id] || 0) + 1; });
      setJml(c);
    })();
  }, []);
  const now = today();
  const lolos = (u) => {
    const aktif = new Date(u.terakhir_aktif);
    if (f === 'Aktif Hari Ini') return aktif >= now;
    if (f === 'Baru Daftar') return new Date(u.dibuat) > addDays(now, -7);
    if (f === 'Tidak Aktif 7 Hari') return aktif < addDays(now, -7);
    return true;
  };
  const tampil = list.filter((u) => (u.nama.toLowerCase().includes(q.toLowerCase()) || u.no_hp.includes(q)) && lolos(u));
  return (
    <Page>
      <Header title="Daftar Pengguna" onBack={nav.pop} />
      <Body>
        <Card style={{ backgroundColor: '#EDE9FE' }}>
          <T style={{ fontWeight: '900', color: '#6D28D9' }}>ANDA - ADMIN DEVELOPER</T>
          <T style={{ fontSize: 14 }}>{nama} · {phone}</T>
        </Card>
        <TextInput value={q} onChangeText={setQ} placeholder="Cari nama / No HP" placeholderTextColor="#9CA3AF"
          style={{ minHeight: 52, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, fontSize: 18, backgroundColor: '#fff', marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {FILTER.map((s) => <Chip key={s} label={s} selected={f === s} onPress={() => setF(s)} />)}
        </View>
        {tampil.length === 0 && <T>Tidak ada pengguna yang cocok.</T>}
        {tampil.map((u) => (
          <Card key={u.id} onPress={() => nav.push('AdminUser', { id: u.id })} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar nama={u.nama} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <T style={{ fontWeight: '800' }}>{u.nama}{u.blokir ? ' (DIBLOKIR)' : ''}</T>
              <T style={{ fontSize: 14, color: C.muted }}>{u.no_hp} · daftar {tgl(u.dibuat)}</T>
              <T style={{ fontSize: 14, color: C.muted }}>Terakhir aktif {jam(u.terakhir_aktif)} · {jml[u.id] || 0} catatan</T>
            </View>
          </Card>
        ))}
      </Body>
    </Page>
  );
}
