import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdminForEvent } from '@/lib/adminAuth';

function unauthorized() {
  return NextResponse.json({ error: 'Tidak diizinkan. Login admin diperlukan.' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Akses ditolak. Sesi Anda hanya berlaku untuk event terkait.' }, { status: 403 });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requestedEventCode = searchParams.get('eventCode');

    // Guard per-event: admin magic-link hanya boleh akses event-nya sendiri.
    const session = requireAdminForEvent(request, requestedEventCode);
    if (!session) return forbidden();

    // Admin magic-link: paksa ke event-nya; superadmin: pakai filter dari request.
    const eventCode = session.role === 'superadmin' ? requestedEventCode : session.eventCode;
    if (!eventCode) {
      return NextResponse.json({ error: 'Event code diperlukan' }, { status: 400 });
    }

    let query = supabaseServer
      .from('photos')
      .select('*')
      .eq('event_code', eventCode)
      .is('deleted_at', null) // Hanya foto yang tidak di-soft-delete
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

// Helper: verifikasi kepemilikan photo oleh sesi admin (anti-IDOR lintas event)
async function getPhotoForSession(photoId, session) {
  const { data: photo, error } = await supabaseServer
    .from('photos')
    .select('id, event_code')
    .eq('id', photoId)
    .single();
  if (error || !photo) return null;
  if (session.role !== 'superadmin' && photo.event_code !== session.eventCode) return null;
  return photo;
}

export async function PATCH(request) {
  try {
    const session = requireAdminForEvent(request);
    if (!session) return unauthorized();
    const { photoId, newStatus } = await request.json();

    if (!photoId || !newStatus) {
      return NextResponse.json({ error: 'photoId dan newStatus wajib diisi' }, { status: 400 });
    }

    // Pastikan foto milik event yang diizinkan sesi ini
    const photo = await getPhotoForSession(photoId, session);
    if (!photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan atau bukan wewenang Anda' }, { status: 403 });
    }

    const { data, error } = await supabaseServer
      .from('photos')
      .update({ status: newStatus })
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update photo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = requireAdminForEvent(request);
    if (!session) return unauthorized();
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: 'photoId wajib diisi' }, { status: 400 });
    }

    // Pastikan foto milik event yang diizinkan sesi ini
    const photo = await getPhotoForSession(photoId, session);
    if (!photo) {
      return NextResponse.json({ error: 'Foto tidak ditemukan atau bukan wewenang Anda' }, { status: 403 });
    }

    // SOFT DELETE: set deleted_at = NOW()
    const { data, error } = await supabaseServer
      .from('photos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}