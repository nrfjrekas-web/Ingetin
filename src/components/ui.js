import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { C, rp, tgl } from '../core/theme';

export const TOP = Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 50;
export const HERO = ['#1E40AF', '#2563EB', '#38BDF8'];

export const Grad = ({ children, style, colors = HERO }) => (
  <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>{children}</LinearGradient>
);
export const T = ({ style, ...p }) => <Text style={[{ fontSize: 18, color: C.text }, style]} {...p} />;
export const Page = ({ children }) => <View style={{ flex: 1, backgroundColor: C.bg }}>{children}</View>;

export const Header = ({ title, onBack, right }) => (
  <Grad style={{ paddingTop: TOP, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 6 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 60, paddingHorizontal: 8 }}>
      {onBack
        ? <Pressable onPress={onBack} hitSlop={8} style={{ padding: 12 }}><Ionicons name="arrow-back" size={26} color="#fff" /></Pressable>
        : <View style={{ width: 12 }} />}
      <T style={{ flex: 1, color: '#fff', fontWeight: '900', fontSize: 21 }}>{title}</T>
      {right}
    </View>
  </Grad>
);

export const Body = ({ children }) => (
  <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
);

export const Card = ({ children, onPress, style }) => {
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress}
      style={[{ backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 3, shadowColor: C.navy, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, style]}>
      {children}
    </Wrap>
  );
};

export const Btn = ({ label, onPress, outline, color = C.blue, disabled, icon }) => (
  <Pressable onPress={onPress} disabled={disabled}
    style={({ pressed }) => ({ minHeight: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, paddingHorizontal: 16, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, backgroundColor: outline ? '#fff' : color, borderWidth: 2, borderColor: color, elevation: outline ? 0 : 3 })}>
    {icon && <Ionicons name={icon} size={22} color={outline ? color : '#fff'} style={{ marginRight: 8 }} />}
    <T style={{ fontWeight: '800', color: outline ? color : '#fff' }}>{label}</T>
  </Pressable>
);

export const Input = ({ label, ...p }) => (
  <View style={{ marginBottom: 14 }}>
    <T style={{ fontSize: 16, color: C.muted, marginBottom: 4, fontWeight: '700' }}>{label}</T>
    <TextInput {...p} placeholderTextColor="#9CA3AF"
      style={{ minHeight: 52, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, fontSize: 18, backgroundColor: '#fff' }} />
  </View>
);

export const Chip = ({ label, color = C.blue, selected, onPress }) => (
  <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, backgroundColor: selected ? color : color + '1F' }}>
    <T style={{ fontSize: 14, fontWeight: '800', color: selected ? '#fff' : color }}>{label}</T>
  </Pressable>
);

const PAL = ['#2563EB', '#16A34A', '#DC2626', '#CA8A04', '#7C3AED', '#0891B2', '#DB2777'];
export const Avatar = ({ nama, size = 48 }) => {
  const c = PAL[[...nama].reduce((a, ch) => a + ch.charCodeAt(0), 0) % PAL.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c + '22', alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ fontSize: size * 0.42, fontWeight: '900', color: c }}>{nama[0].toUpperCase()}</T>
    </View>
  );
};

export const Err = ({ children }) => (children ? <T style={{ color: C.red, fontSize: 16, marginBottom: 10 }}>{children}</T> : null);

export function DateField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Pressable onPress={() => setShow(true)}
        style={{ minHeight: 52, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' }}>
        <Ionicons name="calendar" size={22} color={C.blue} style={{ marginRight: 10 }} />
        <T style={{ flex: 1 }}>{label}</T><T style={{ fontWeight: '800' }}>{tgl(value)}</T>
      </Pressable>
      {show && (
        <DateTimePicker value={value} mode="date"
          onChange={(e, d) => { setShow(Platform.OS === 'ios'); if (e.type !== 'dismissed' && d) onChange(d); }} />
      )}
    </View>
  );
}

// Isian uang: diketik 2000000 langsung tampil Rp 2.000.000. Nilai (value) tetap string angka murni.
export const UangInput = ({ label, value, onChange }) => (
  <Input label={label} value={value ? rp(Number(value)) : ''} placeholder="Rp 0" keyboardType="number-pad"
    onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 12))} />
);

// Animasi masuk halus untuk setiap layar.
export function FadeIn({ children, style }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[{ flex: 1, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}
