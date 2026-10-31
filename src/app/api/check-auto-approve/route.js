import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdminForEvent, verifyCronSecret } from '@/lib/adminAuth';

// Endpoint ini MENGUBAH data (approve massal), jadi hanya boleh dipanggil
// oleh admin yang login (POST) atau oleh cron job dengan Bearer CRON_SECRET.
// Cron selalu boleh; admin biasa hanya boleh event yang terikat pada sesinya.
// Return: true (cron/superadmin) atau string eventCode (harus dicocokkan).
function authorize(request, eventCode) {
  if (verifyCronSecret(request)) return true;
  const session = requireAdminForEvent(request, eventCode);
  if (!session) return false;
  if (session.role === 'superadmin') return true;
  return session.eventCode;
}

async function runAutoApprove(eventCode) {
  // 1. Ambil pengaturan delay untuk event ini
  const { data: eventData, error: eventError } = await supabaseServer
    .from('events')
    .select('auto_approve_delay')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventData || !eventData.auto_approve_delay) {
    // Jika tidak ada delay (Manual Only), lewati proses ini
    return NextResponse.json({ success: true, message: 'Manual approval mode', updated: 0 });
  }

  const delayMinutes = eventData.auto_approve_delay;

  // 2. Hitung batas waktu (created_at harus lebih lama dari delay ini)
  const cutoffDate = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

  // 3. Update semua foto pending yang sudah melewati batas waktu
  const { data, error } = await supabaseServer
    .from('photos')
    .update({ status: 'approved' })
    .eq('event_code', eventCode)
    .eq('status', 'pending')
    .lt('created_at', cutoffDate)
    .select('id');

  if (error) throw error;

  const updatedCount = data ? data.length : 0;
  return NextResponse.json({ success: true, updated: updatedCount });
}

export async function POST(request) {
  try {
    let eventCode;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      eventCode = (await request.json()).eventCode;
    } else {
      eventCode = new URL(request.url).searchParams.get('eventCode');
    }

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code required' }, { status: 400 });
    }

    const auth = authorize(request, eventCode);
    if (auth === false || (typeof auth === 'string' && auth !== eventCode)) {
      return NextResponse.json({ error: 'Tidak diizinkan. Event ini bukan wewenang sesi Anda.' }, { status: 403 });
    }

    return await runAutoApprove(eventCode);
  } catch (error) {
    console.error('Auto-approve error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

// GET tetap didukung sementara untuk backward compatibility (mis. pemanggil lama),
// tetapi tetap dilindungi auth yang sama.
export async function GET(request) {
  try {
    const eventCode = new URL(request.url).searchParams.get('eventCode');
    if (!eventCode) {
      return NextResponse.json({ error: 'Event code required' }, { status: 400 });
    }
    const auth = authorize(request, eventCode);
    if (auth === false || (typeof auth === 'string' && auth !== eventCode)) {
      return NextResponse.json({ error: 'Tidak diizinkan. Event ini bukan wewenang sesi Anda.' }, { status: 403 });
    }
    return await runAutoApprove(eventCode);
  } catch (error) {
    console.error('Auto-approve error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
