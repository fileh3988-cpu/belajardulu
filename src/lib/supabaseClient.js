import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Debugging (bisa dihapus nanti kalau sudah jalan)
console.log('🔍 DEBUG URL:', supabaseUrl);
console.log('🔍 DEBUG ANON:', supabaseAnonKey ? 'Panjang: ' + supabaseAnonKey.length : 'KOSONG!');
console.log('🔍 DEBUG SERVICE:', supabaseServiceKey ? 'Panjang: ' + supabaseServiceKey.length : 'KOSONG!');

// Validasi URL
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL tidak valid. Cek .env.local Anda!');
}

// 1. Client untuk Browser (WAJIB untuk Realtime & halaman Guest/Display)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

// 2. Client untuk Server (WAJIB untuk API Routes /admin agar bypass RLS)
// Jika service key tidak ada, kita pakai anon key sebagai fallback (untuk development saja)
// Di production, ini akan menyebabkan error keamanan, jadi pastikan isi .env.local dengan benar
export const supabaseServer = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey, // Fallback ke anon key jika service key kosong
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);