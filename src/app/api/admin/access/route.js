import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { createSessionToken, sessionCookieOptions, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 400 });
    }

    // Cari event dengan token ini
    const { data: event, error } = await supabaseServer
      .from('events')
      .select('*')
      .eq('magic_link_token', token)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Link tidak valid' }, { status: 404 });
    }

    // Cek apakah link sudah expired
    if (event.magic_link_expires_at) {
      const expiresAt = new Date(event.magic_link_expires_at);
      const now = new Date();
      
      if (now > expiresAt) {
        return NextResponse.json({ 
          error: 'Link sudah kadaluarsa',
          expired: true 
        }, { status: 410 });
      }
    }

    // Link valid — buat sesi admin (httpOnly cookie) yang TERIKAT ke event ini.
    // eventCode ikut ditandatangani di token, jadi admin magic-link tidak bisa
    // mengakses data event lain meskipun mengganti parameter di URL/API.
    const response = NextResponse.json({
      success: true,
      event: {
        code: event.event_code,
        name: event.name,
      }
    });
    response.cookies.set(ADMIN_COOKIE_NAME, createSessionToken('admin', event.event_code), sessionCookieOptions());
    return response;

  } catch (error) {
    console.error('Access validation error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}