import { supabase } from './supabase';

// Memanggil Edge Function "admin-aksi" di Supabase. Pengecekan admin dilakukan di server.
export async function aksiAdmin(body) {
  const { data, error } = await supabase.functions.invoke('admin-aksi', { body });
  if (error) {
    let pesan = 'Gagal menghubungi server. Cek internet dan pastikan fungsi admin-aksi sudah di-deploy di proyek yang benar.';
    const res = error.context;
    try {
      const j = await res.json();
      if (j && j.pesan) pesan = j.pesan;
      else if (res && res.status) pesan = `Server menjawab ${res.status}: ${(j && (j.message || j.msg || j.error)) || 'tanpa keterangan'}`;
    } catch (e) {
      if (res && res.status) pesan = `Server menjawab ${res.status}.`;
    }
    return { error: pesan };
  }
  return { data };
}
