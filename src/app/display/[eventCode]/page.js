import ThemeScript from '@/components/ThemeScript';
import DisplayView from './DisplayView';
import { supabaseServer } from '@/lib/supabaseClient';

// Server Component tipis: ambil tema dari database SEBELUM HTML dikirim,
// supaya script anti-flash memasang warna benar sejak frame pertama —
// tidak ada kedip bahkan saat akses pertama kali / refresh.
export default async function DisplayPage({ params }) {
  const { eventCode } = await params;

  let theme = null;
  try {
    const { data } = await supabaseServer
      .from('events')
      .select('theme')
      .eq('event_code', eventCode)
      .single();
    theme = data?.theme || null;
  } catch (e) {
    // Event tidak ditemukan / DB error → biarkan null, client akan fallback
  }

  return (
    <>
      <ThemeScript eventCode={eventCode} serverTheme={theme} />
      <DisplayView eventCode={eventCode} initialTheme={theme} />
    </>
  );
}
