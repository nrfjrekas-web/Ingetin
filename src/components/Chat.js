import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { C, jam } from '../core/theme';

// Tampilan percakapan. saya = 'user' atau 'admin' (sisi yang sedang memakai layar ini).
export default function Chat({ pesan, saya, onKirim, kosong }) {
  const ref = useRef(null);
  const [teks, setTeks] = useState('');
  const [kirim, setKirim] = useState(false);
  useEffect(() => { const t = setTimeout(() => ref.current && ref.current.scrollToEnd({ animated: true }), 80); return () => clearTimeout(t); }, [pesan.length]);
  const kirimPesan = async () => {
    const t = teks.trim();
    if (!t || kirim) return;
    setKirim(true);
    const ok = await onKirim(t);
    setKirim(false);
    if (ok !== false) setTeks('');
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled">
        {pesan.length === 0 && kosong}
        {pesan.map((m) => {
          const milik = m.pengirim === saya;
          return (
            <View key={m.id} style={{ alignSelf: milik ? 'flex-end' : 'flex-start', maxWidth: '82%', marginBottom: 10 }}>
              <View style={{ backgroundColor: milik ? C.blue : '#fff', borderRadius: 16, borderBottomRightRadius: milik ? 4 : 16, borderBottomLeftRadius: milik ? 16 : 4, paddingHorizontal: 14, paddingVertical: 9, elevation: milik ? 0 : 1, borderWidth: milik ? 0 : 1, borderColor: '#E2E8F0' }}>
                {!milik && <T style={{ fontSize: 12, fontWeight: '900', color: C.blue, marginBottom: 2 }}>{saya === 'user' ? 'Admin INGETIN' : 'Pengguna'}</T>}
                <T style={{ fontSize: 16, color: milik ? '#fff' : C.text }}>{m.isi}</T>
              </View>
              <T style={{ fontSize: 11, color: C.muted, alignSelf: milik ? 'flex-end' : 'flex-start', marginTop: 2 }}>{jam(m.dibuat)}</T>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
        <TextInput value={teks} onChangeText={(v) => setTeks(v.slice(0, 1000))} placeholder="Tulis pesan..." placeholderTextColor="#9CA3AF" multiline
          style={{ flex: 1, maxHeight: 110, minHeight: 46, borderWidth: 1.5, borderColor: C.line, borderRadius: 23, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 11, fontSize: 16, backgroundColor: '#F8FAFC' }} />
        <Pressable onPress={kirimPesan} disabled={kirim} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginLeft: 8, opacity: kirim || !teks.trim() ? 0.5 : 1 }}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
