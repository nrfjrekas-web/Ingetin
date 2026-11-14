import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StatusBar, View } from 'react-native';
import { StoreProvider, useStore } from './src/store/store';
import LoginScreen from './src/screens/LoginScreen';
import ShellScreen from './src/screens/ShellScreen';
import PersonScreen from './src/screens/PersonScreen';
import DebtFormScreen from './src/screens/DebtFormScreen';
import PayFormScreen from './src/screens/PayFormScreen';
import { C } from './src/core/theme';

// Daftar layar. Tambah layar baru: buat file di src/screens lalu daftarkan di sini.
const SCREENS = { Shell: ShellScreen, Person: PersonScreen, DebtForm: DebtFormScreen, PayForm: PayFormScreen };

function Router() {
  const { ready, phone } = useStore();
  const [stack, setStack] = useState([{ name: 'Shell' }]);
  const nav = {
    push: (name, params) => setStack((s) => [...s, { name, params }]),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
  };
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { nav.pop(); return true; }
      return false;
    });
    return () => h.remove();
  }, [stack]);
  useEffect(() => { if (!phone) setStack([{ name: 'Shell' }]); }, [phone]);

  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={C.blue} /></View>;
  if (!phone) return <LoginScreen />;
  const top = stack[stack.length - 1];
  const Screen = SCREENS[top.name];
  return <Screen key={stack.length} nav={nav} {...top.params} />;
}

export default function App() {
  return (
    <StoreProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Router />
    </StoreProvider>
  );
}
