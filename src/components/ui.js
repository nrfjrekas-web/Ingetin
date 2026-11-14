import React, { useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { C, tgl } from '../core/theme';

export const T = ({ style, ...p }) => <Text style={[{ fontSize: 18, color: C.text }, style]} {...p} />;

export const Page = ({ children }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
    {children}
  </SafeAreaView>
);

export const Header = ({ title, onBack, right }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line }}>
    {onBack ? <Pressable onPress={onBack} style={{ padding: 12 }}><T style={{ fontSize: 24 }}>←</T></Pressable> : <View style={{ width: 12 }} />}
    <T style={{ flex: 1, fontWeight: '900', fontSize: 20 }}>{title}</T>
    {right}
  </View>
);

export const Body = ({ children }) => (
  <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
);

export const Card = ({ children, onPress, style }) => {
  const Wrap = onPress ? Pressable : View;
  return <Wrap onPress={onPress} style={[{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.line }, style]}>{children}</Wrap>;
};

export const Btn = ({ label, onPress, outline, color = C.blue, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled}
    style={{ minHeight: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, paddingHorizontal: 16, opacity: disabled ? 0.5 : 1, backgroundColor: outline ? '#fff' : color, borderWidth: 2, borderColor: color }}>
    <T style={{ fontWeight: '800', color: outline ? color : '#fff' }}>{label}</T>
  </Pressable>
);

export const Input = ({ label, ...p }) => (
  <View style={{ marginBottom: 14 }}>
    <T style={{ fontSize: 16, color: C.muted, marginBottom: 4 }}>{label}</T>
    <TextInput {...p} placeholderTextColor="#9CA3AF"
      style={{ minHeight: 52, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 14, fontSize: 18, backgroundColor: '#fff' }} />
  </View>
);

export const Chip = ({ label, color = C.blue, selected, onPress }) => (
  <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, backgroundColor: selected ? color : color + '1F' }}>
    <T style={{ fontSize: 14, fontWeight: '800', color: selected ? '#fff' : color }}>{label}</T>
  </Pressable>
);

export const Err = ({ children }) => (children ? <T style={{ color: C.red, fontSize: 16, marginBottom: 10 }}>{children}</T> : null);

export function DateField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Pressable onPress={() => setShow(true)}
        style={{ minHeight: 52, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
        <T>{label}</T><T style={{ fontWeight: '800' }}>{tgl(value)}</T>
      </Pressable>
      {show && (
        <DateTimePicker value={value} mode="date"
          onChange={(e, d) => { setShow(Platform.OS === 'ios'); if (e.type !== 'dismissed' && d) onChange(d); }} />
      )}
    </View>
  );
}
