import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { C } from '../core/theme';

// Navigasi bawah: selalu tampil di semua layar setelah login.
const Item = ({ label, icon, on, onPress }) => (
  <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingTop: 10, minHeight: 60 }}>
    <Ionicons name={on ? icon : icon + '-outline'} size={25} color={on ? C.blue : C.muted} />
    <T style={{ fontSize: 12, fontWeight: '800', color: on ? C.blue : C.muted }}>{label}</T>
  </Pressable>
);

export default function BottomNav({ aktif, onTab }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, elevation: 16, paddingBottom: 14, alignItems: 'flex-start' }}>
      <Item label="Beranda" icon="home" on={aktif === 0} onPress={() => onTab('Beranda')} />
      <Item label="Orang" icon="people" on={aktif === 1} onPress={() => onTab('Daftar')} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Pressable onPress={() => onTab('DebtForm')}
          style={{ marginTop: -28, width: 66, height: 66, borderRadius: 33, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: C.bg, elevation: 8 }}>
          <Ionicons name="add" size={38} color={C.navy} />
        </Pressable>
        <T style={{ fontSize: 12, fontWeight: '900', color: aktif === 2 ? C.blue : C.navy }}>Catat</T>
      </View>
      <Item label="Bayar" icon="cash" on={aktif === 3} onPress={() => onTab('PayForm')} />
      <Item label="Akun" icon="person-circle" on={aktif === 4} onPress={() => onTab('Akun')} />
    </View>
  );
}
