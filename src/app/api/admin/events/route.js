import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdminForEvent, requireSuperAdmin } from '@/lib/adminAuth';

// Alias lokal agar jelas maknanya di handler pembuatan event
const requireSuperAdminOnly = requireSuperAdmin;

export async function GET(request) {
  try {
    // Guard per-event: admin magic-link hanya boleh melihat event-nya sendiri.
    const session = requireAdminForEvent(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan. Login admin diperlukan.' }, { status: 401 });
    }

    let query = supabaseServer
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    // Paksa filter ke event milik sesi jika bukan superadmin
    if (session.role !== 'superadmin') {
      query = query.eq('code', session.eventCode);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Membuat event baru adalah hak khusus superadmin
    if (!requireSuperAdminOnly(request)) {
      return NextResponse.json({ error: 'Tidak diizinkan. Hanya superadmin yang dapat membuat event.' }, { status: 403 });
    }

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
    // Generate unique code (slug + suffix acak agar tidak bentrok untuk nama serupa)
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'event';
    const suffix = randomBytes(3).toString('hex'); // 6 karakter hex
    const eventCode = `${slug}-${suffix}`;
    // Token kriptografis aman (bukan Math.random)
    const magicLinkToken = randomBytes(24).toString('base64url');

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

    if (error) {
      console.error('Create event DB error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Event dengan kode yang sama sudah ada. Coba lagi.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Gagal membuat event. Coba lagi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}