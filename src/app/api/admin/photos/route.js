import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventCode = searchParams.get('eventCode');

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { photoId, newStatus } = await request.json();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { photoId } = await request.json();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}