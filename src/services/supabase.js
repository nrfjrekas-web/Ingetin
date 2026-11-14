import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../core/config';

export const TERHUBUNG = !SUPABASE_URL.startsWith('ISI');
export const supabase = createClient(TERHUBUNG ? SUPABASE_URL : 'https://belum-diisi.supabase.co', TERHUBUNG ? SUPABASE_ANON_KEY : 'belum-diisi', {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
