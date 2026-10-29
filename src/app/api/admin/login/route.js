import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Cek password dari environment variable
    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        message: 'Login berhasil' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Password salah' 
    }, { status: 401 });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan' 
    }, { status: 500 });
  }
}