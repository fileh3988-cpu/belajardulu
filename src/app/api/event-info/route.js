import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventCode = searchParams.get('code');

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code required' }, { status: 400 });
    }

    const { data: event, error } = await supabaseServer
      .from('events')
      .select('name, code, theme')
      .eq('code', eventCode)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Sertakan etag tema di header HTML SEBELUM JS bundle dimuat, supaya
    // script anti-flash bisa langsung pasang warna yang benar sejak frame
    // pertama (tidak ada lagi kedip saat buka/refresh pertama kali).
    const themeEtag = `"th-${event.theme || 'elegant'}"`;
    return NextResponse.json(
      { success: true, event },
      {
        headers: {
          'Cache-Control': 'no-store',
          'ETag': themeEtag,
          'x-event-theme': event.theme || 'elegant',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}