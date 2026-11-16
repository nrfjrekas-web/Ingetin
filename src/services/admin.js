import { supabase } from './supabase';

// Memanggil Edge Function "admin-aksi" di Supabase. Pengecekan admin dilakukan di server.
export async function aksiAdmin(body) {
  const { data, error } = await supabase.functions.invoke('admin-aksi', { body });
  if (error) {
    let pesan = 'Gagal menghubungi server. Cek internet dan pastikan fungsi admin-aksi sudah di-deploy.';
    try { const j = await error.context.json(); if (j && j.pesan) pesan = j.pesan; } catch (e) { /* pakai pesan umum */ }
    return { error: pesan };
  }
  return { data };
}
