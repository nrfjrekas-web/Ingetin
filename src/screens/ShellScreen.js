import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../store/store';
import { Header, Page, T } from '../components/ui';
import { APP, C } from '../core/theme';
import BerandaScreen from './BerandaScreen';
import DaftarScreen from './DaftarScreen';

const TABS = [['Beranda', '🏠'], ['Hutang & Piutang', '👥']];

export default function ShellScreen({ nav }) {
  const { logout } = useStore();
  const [tab, setTab] = useState(0);
  return (
    <Page>
      <Header title={APP}
        right={<Pressable onPress={logout} style={{ padding: 12 }}><T style={{ fontSize: 16, color: C.blue, fontWeight: '800' }}>Keluar</T></Pressable>} />
      <View style={{ flex: 1 }}>{tab === 0 ? <BerandaScreen nav={nav} /> : <DaftarScreen nav={nav} />}</View>
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line }}>
        {TABS.map(([nama, ikon], i) => (
          <Pressable key={nama} onPress={() => setTab(i)} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, minHeight: 56 }}>
            <T style={{ fontSize: 20 }}>{ikon}</T>
            <T style={{ fontSize: 14, fontWeight: '800', color: tab === i ? C.blue : C.muted }}>{nama}</T>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
