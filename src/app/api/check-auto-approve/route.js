import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventCode = searchParams.get('eventCode');

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code required' }, { status: 400 });
    }

    // 1. Ambil pengaturan delay untuk event ini
    const { data: eventData, error: eventError } = await supabaseServer
      .from('events')
      .select('auto_approve_delay')
      .eq('code', eventCode)
      .single();

    if (eventError || !eventData || !eventData.auto_approve_delay) {
      // Jika tidak ada delay (Manual Only), lewati proses ini
      return NextResponse.json({ success: true, message: 'Manual approval mode', updated: 0 });
    }

    const delayMinutes = eventData.auto_approve_delay;
    
    // 2. Hitung batas waktu (created_at harus lebih lama dari delay ini)
    // Contoh: Jika delay 30 menit, kita cari foto yang dibuat > 30 menit yang lalu
    const cutoffDate = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

    // 3. Update semua foto pending yang sudah melewati batas waktu
    const { data, error } = await supabaseServer
      .from('photos')
      .update({ status: 'approved' })
      .eq('event_code', eventCode)
      .eq('status', 'pending')
      .lt('created_at', cutoffDate) // created_at < cutoffDate (lebih tua dari batas waktu)
      .select('id');

    if (error) throw error;

    const updatedCount = data ? data.length : 0;
    console.log(`✅ Auto-approved ${updatedCount} photos for event ${eventCode}`);

    return NextResponse.json({ success: true, updated: updatedCount });
  } catch (error) {
    console.error('Auto-approve error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}