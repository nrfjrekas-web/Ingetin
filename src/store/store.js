import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { APP } from '../core/theme';
import { buildSeed } from './seed';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);
const hash = (hp, pin) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${APP}:${hp}:${pin}`);
const EMPTY = { persons: [], debts: [] };

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(null);
  const [data, setData] = useState(EMPTY);

  const open = async (hp) => {
    const raw = await AsyncStorage.getItem('d_' + hp);
    setData(raw ? JSON.parse(raw) : EMPTY);
    setPhone(hp);
    await AsyncStorage.setItem('last', hp);
  };
  const save = (next) => { setData(next); AsyncStorage.setItem('d_' + phone, JSON.stringify(next)); };

  useEffect(() => {
    (async () => {
      const demo = '08123456789';
      if (!(await AsyncStorage.getItem('u_' + demo))) {
        await AsyncStorage.setItem('u_' + demo, await hash(demo, '123456'));
        await AsyncStorage.setItem('d_' + demo, JSON.stringify(buildSeed()));
      }
      const last = await AsyncStorage.getItem('last');
      if (last) await open(last);
      setReady(true);
    })();
  }, []);

  const login = async (hp, pin) => {
    if ((await AsyncStorage.getItem('u_' + hp)) !== (await hash(hp, pin))) return 'No HP atau PIN salah.';
    await open(hp);
    return null;
  };
  const register = async (hp, pin) => {
    if (!/^\d{9,}$/.test(hp)) return 'No HP tidak valid.';
    if (!/^\d{6}$/.test(pin)) return 'PIN harus 6 angka.';
    if (await AsyncStorage.getItem('u_' + hp)) return 'No HP sudah terdaftar. Silakan masuk.';
    await AsyncStorage.setItem('u_' + hp, await hash(hp, pin));
    await open(hp);
    return null;
  };
  const logout = async () => { await AsyncStorage.removeItem('last'); setPhone(null); };

  const addDebt = (f) => {
    const persons = [...data.persons];
    const i = persons.findIndex((x) => x.nama.toLowerCase() === f.nama.toLowerCase());
    let p;
    if (i < 0) { p = { id: 'p' + Date.now(), nama: f.nama, wa: f.wa }; persons.push(p); }
    else { p = { ...persons[i], wa: f.wa || persons[i].wa }; persons[i] = p; }
    const debt = { id: 'd' + Date.now(), personId: p.id, jenis: f.jenis, awal: f.jumlah, ket: f.ket,
      pinjam: f.pinjam.toISOString(), tempo: f.tempo.toISOString(), pays: [] };
    save({ persons, debts: [...data.debts, debt] });
  };
  const addPay = (debtId, pay) =>
    save({ ...data, debts: data.debts.map((d) => (d.id === debtId ? { ...d, pays: [...d.pays, pay] } : d)) });

  const value = {
    ready, phone, ...data, login, register, logout, addDebt, addPay,
    person: (id) => data.persons.find((p) => p.id === id),
    debtsOf: (pid) => data.debts.filter((d) => d.personId === pid),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
