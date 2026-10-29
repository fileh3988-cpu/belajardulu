import ThemeScript from '@/components/ThemeScript';
import GuestView from './GuestView';
import { supabaseServer } from '@/lib/supabaseClient';

// Server Component tipis: ambil tema dari database SEBELUM HTML dikirim,
// supaya script anti-flash bisa memasang warna yang benar sejak frame
// pertama — tidak ada kedip lagi saat akses pertama / refresh.
export default async function GuestPage({ params }) {
  const { eventCode } = await params;

  let theme = null;
  try {
    const { data } = await supabaseServer
      .from('events')
      .select('theme')
      .eq('code', eventCode)
      .single();
    theme = data?.theme || null;
  } catch (e) {
    // Event tidak ditemukan / DB error → biarkan null, client akan fallback
  }

  return (
    <>
      <ThemeScript eventCode={eventCode} serverTheme={theme} />
      <GuestView eventCode={eventCode} initialTheme={theme} />
    </>
  );
}
