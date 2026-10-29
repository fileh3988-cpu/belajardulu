// Script anti-flash: dijalankan SEBELUM HTML dirender di browser.
// Tema diambil dari DATABASE oleh server component (page.js) lalu disisipkan
// ke sini — jadi sejak frame pertama warna sudah benar, bahkan saat akses
// PERTAMA kali / refresh (belum ada cache localStorage sama sekali).
// localStorage tetap dipakai sebagai cadangan bila query DB gagal.
import { DEFAULT_THEME_ID, resolveTheme } from '@/lib/themes';

export default function ThemeScript({ eventCode, serverTheme }) {
  const code = JSON.stringify(String(eventCode || ''));
  const server = JSON.stringify(resolveTheme(serverTheme));
  const fallback = JSON.stringify(DEFAULT_THEME_ID);
  // Prioritas: tema dari DB > cache localStorage > default registry
  const html = `try{var c=${code};var s=${server};var t=(s&&s!=='null')?s:(localStorage.getItem('theme_'+c)||${fallback});document.documentElement.setAttribute('data-theme',t);}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: html }} />;
}
