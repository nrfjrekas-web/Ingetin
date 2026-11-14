import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';
import { Header, Page, T } from '../components/ui';
import { C } from '../core/theme';
import BerandaScreen from './BerandaScreen';
import DaftarScreen from './DaftarScreen';

const Item = ({ label, icon, on, onPress }) => (
  <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingTop: 10, minHeight: 60 }}>
    <Ionicons name={on ? icon : icon + '-outline'} size={25} color={on ? C.blue : C.muted} />
    <T style={{ fontSize: 12, fontWeight: '800', color: on ? C.blue : C.muted }}>{label}</T>
  </Pressable>
);

export default function ShellScreen({ nav }) {
  const { logout } = useStore();
  const [tab, setTab] = useState(0);
  const keluar = () => Alert.alert('Keluar?', 'Anda bisa masuk lagi dengan No HP dan PIN.', [
    { text: 'Batal', style: 'cancel' }, { text: 'Keluar', onPress: logout }]);
  return (
    <Page>
      {tab === 1 && <Header title="Hutang & Piutang" />}
      <View style={{ flex: 1 }}>{tab === 0 ? <BerandaScreen nav={nav} /> : <DaftarScreen nav={nav} />}</View>
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, elevation: 16, paddingBottom: 14, alignItems: 'flex-start' }}>
        <Item label="Beranda" icon="home" on={tab === 0} onPress={() => setTab(0)} />
        <Item label="Orang" icon="people" on={tab === 1} onPress={() => setTab(1)} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable onPress={() => nav.push('DebtForm')}
            style={{ marginTop: -28, width: 66, height: 66, borderRadius: 33, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: C.bg, elevation: 8 }}>
            <Ionicons name="add" size={38} color={C.navy} />
          </Pressable>
          <T style={{ fontSize: 12, fontWeight: '900', color: C.navy }}>Catat</T>
        </View>
        <Item label="Bayar" icon="cash" on={false} onPress={() => nav.push('PayForm')} />
        <Item label="Keluar" icon="log-out" on={false} onPress={keluar} />
      </View>
    </Page>
  );
}
