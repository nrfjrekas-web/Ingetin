import React from 'react';
import { Pressable, View } from 'react-native';
import { T } from './ui';
import { C } from '../core/theme';

// Kalau satu layar error, aplikasi tidak langsung tertutup: tampil pesan dan tombol kembali.
export default class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <T style={{ fontSize: 20, fontWeight: '900', textAlign: 'center' }}>Ups, halaman ini gagal dimuat</T>
        <T style={{ textAlign: 'center', marginVertical: 12, color: C.muted }}>Coba lagi. Kalau terulang, laporkan lewat menu Akun, lalu Laporkan Masalah.</T>
        <Pressable onPress={() => { this.setState({ error: false }); if (this.props.onReset) this.props.onReset(); }}
          style={{ backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 24, minHeight: 52, justifyContent: 'center' }}>
          <T style={{ color: '#fff', fontWeight: '800' }}>Kembali ke Beranda</T>
        </Pressable>
      </View>
    );
  }
}
