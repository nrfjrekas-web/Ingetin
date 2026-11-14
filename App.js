import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, View } from 'react-native';
import { StoreProvider, useStore } from './src/store/store';
import { FadeIn, Grad } from './src/components/ui';
import BottomNav from './src/components/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import BerandaScreen from './src/screens/BerandaScreen';
import DaftarScreen from './src/screens/DaftarScreen';
import AkunScreen from './src/screens/AkunScreen';
import PersonScreen from './src/screens/PersonScreen';
import DebtFormScreen from './src/screens/DebtFormScreen';
import PayFormScreen from './src/screens/PayFormScreen';
import LaporScreen from './src/screens/LaporScreen';
import AdminHome from './src/screens/AdminHome';
import AdminUsers from './src/screens/AdminUsers';
import AdminUser from './src/screens/AdminUser';
import AdminReports from './src/screens/AdminReports';
import AdminSettings from './src/screens/AdminSettings';
import { C } from './src/core/theme';

const logo = require('./assets/icon.png');
// Daftar layar. Tambah layar baru: buat file di src/screens lalu daftarkan di sini.
const SCREENS = { Beranda: BerandaScreen, Daftar: DaftarScreen, Akun: AkunScreen, Person: PersonScreen, DebtForm: DebtFormScreen, PayForm: PayFormScreen,
  Lapor: LaporScreen, AdminHome, AdminUsers, AdminUser, AdminReports, AdminSettings };
// Menu bawah yang menyala untuk tiap layar.
const AKTIF = { Beranda: 0, Daftar: 1, Person: 1, DebtForm: 2, PayForm: 3, Akun: 4, Lapor: 4, AdminHome: 4, AdminUsers: 4, AdminUser: 4, AdminReports: 4, AdminSettings: 4 };

function Splash({ onDone }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([Animated.spring(s, { toValue: 1, friction: 5, useNativeDriver: true }), Animated.delay(600)]).start(onDone);
  }, []);
  return (
    <Grad style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image source={logo} style={{ width: 150, height: 150, borderRadius: 38, opacity: s, transform: [{ scale: s.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] }} />
      <Animated.Text style={{ opacity: s, color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 16, letterSpacing: 2 }}>INGETIN</Animated.Text>
      <Animated.Text style={{ opacity: s, color: '#DBEAFE', fontSize: 16 }}>Catatan bon, kas & hutang dusun</Animated.Text>
    </Grad>
  );
}

function Router() {
  const { ready, phone } = useStore();
  const [splash, setSplash] = useState(true);
  const [stack, setStack] = useState([{ name: 'Beranda' }]);
  const nav = {
    push: (name, params) => setStack((s) => [...s, { name, params }]),
    pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    tab: (name) => setStack(name === 'Beranda' ? [{ name }] : [{ name: 'Beranda' }, { name }]),
  };
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { nav.pop(); return true; }
      return false;
    });
    return () => h.remove();
  }, [stack]);
  useEffect(() => { if (!phone) setStack([{ name: 'Beranda' }]); }, [phone]);

  if (splash || !ready) return <Splash onDone={() => setSplash(false)} />;
  if (!phone) return <LoginScreen />;
  const top = stack[stack.length - 1];
  const Screen = SCREENS[top.name];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FadeIn key={top.name + stack.length}><Screen nav={nav} {...top.params} /></FadeIn>
      <BottomNav aktif={AKTIF[top.name]} onTab={nav.tab} />
    </View>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Router />
    </StoreProvider>
  );
}
