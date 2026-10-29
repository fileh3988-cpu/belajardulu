import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      autoApproveDelay = '60', 
      magicLinkDuration = '7',
      theme = 'elegant',
      client_name = '',
      client_email = '',
      client_phone = '',
      event_date = null,
      venue = '',
      max_uploads = 1000
    } = body;
        
    if (!name) {
      return NextResponse.json({ error: 'Nama event wajib diisi' }, { status: 400 });
    }
    // Konversi delay ke integer. Jika kosong atau bukan angka, pakai 999999 (Manual Only)
    let delayValue = parseInt(autoApproveDelay);
    if (isNaN(delayValue) || autoApproveDelay === '') {
      delayValue = 999999; 
    }
    // Generate unique code
    const eventCode = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    const magicLinkToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const { data, error } = await supabaseServer
      .from('events')
      .insert([{
        code: eventCode,
        name,
        magic_link_token: magicLinkToken,
        auto_approve_delay: delayValue,
        magic_link_duration: magicLinkDuration,
        theme,
        client_name,
        client_email,
        client_phone,
        event_date,
        venue,
        max_uploads,
        status: 'upcoming'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}