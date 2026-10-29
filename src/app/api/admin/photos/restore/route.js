import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID diperlukan' }, { status: 400 });
    }

    // UNDO SOFT DELETE: set deleted_at = NULL
    const { data, error } = await supabaseServer
      .from('photos')
      .update({ deleted_at: null })
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Restore photo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}