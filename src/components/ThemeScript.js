// Script anti-flash: dijalankan SEBELUM HTML dirender di browser.
// Membaca tema event dari localStorage (instan) dan memasang data-theme
// langsung ke <html>, sehingga warna halaman sudah benar sejak frame pertama.
// Jika belum ada cache, default 'elegant' dipakai dulu; setelah API menjawab,
// client component akan update + simpan ke localStorage untuk kunjungan berikutnya.
export default function ThemeScript({ eventCode }) {
  const code = JSON.stringify(String(eventCode || ''));
  const html = `try{var c=${code};var t=localStorage.getItem('theme_'+c)||'elegant';document.documentElement.setAttribute('data-theme',t);}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: html }} />;
}
