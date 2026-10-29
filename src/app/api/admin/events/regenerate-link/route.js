import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseServer } from '@/lib/supabaseClient';
import { requireAdminForEvent } from '@/lib/adminAuth';

// POST { code } — ambil token magic link sebuah event untuk disalin dari tabel.
// Token lama digantikan token baru (link lama otomatis mati) => aman jika pernah bocor.
export async function POST(request) {
  try {
    const session = requireAdminForEvent(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak diizinkan. Login admin diperlukan.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { code } = body;
    if (!code) {
      return NextResponse.json({ error: 'Kode event wajib diisi' }, { status: 400 });
    }

    // Admin magic-link hanya boleh menyentuh event miliknya sendiri
    if (session.role !== 'superadmin' && session.eventCode !== code) {
      return NextResponse.json({ error: 'Tidak diizinkan untuk event ini.' }, { status: 403 });
    }

    const freshToken = randomBytes(24).toString('base64url');

    const { data, error } = await supabaseServer
      .from('events')
      .update({ magic_link_token: freshToken })
      .eq('code', code)
      .select('magic_link_token')
      .single();

    if (error || !data) {
      console.error('Regenerate link error:', error);
      return NextResponse.json({ error: 'Gagal mengambil link admin' }, { status: 500 });
    }

    return NextResponse.json({ success: true, token: data.magic_link_token });
  } catch (error) {
    console.error('Regenerate link error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
