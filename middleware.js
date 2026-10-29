import { NextResponse } from 'next/server';

// Halaman admin (UI) dilindungi di sini sebagai lapisan pertama.
// Perlindungan DATA sesungguhnya ada di API routes: sesi magic-link admin biasa
// terikat satu eventCode (diverifikasi via requireAdminForEvent di src/lib/adminAuth.js),
// sehingga mengganti parameter event di URL tidak memberi akses ke event lain.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Guard dashboard & report, tapi izinkan /admin/login dan /admin/access
  const isPublicAdminPage = pathname === '/admin/login' || pathname === '/admin/access';
  if (!isPublicAdminPage) {
    const session = request.cookies.get('admin_session');
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
