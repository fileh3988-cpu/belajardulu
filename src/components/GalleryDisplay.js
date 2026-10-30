'use client';
import { useState } from 'react';
import { X, Clock } from 'lucide-react';

// ============================================================
// GALLERY DISPLAY — versi layar besar (TV/projector) tema Gallery.
// Sengaja memakai visual yang SAMA dengan halaman upload (/e/...):
// dinding linen + foto berbingkai emas + plakat nama, warna & font
// dari CSS variable [data-theme="gallery"]. Bingkai muncul bergantian
// (fade carousel) sehingga dinamis tapi tetap elegan.
// ============================================================
export default function GalleryDisplay({ eventCode, photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [current, setCurrent] = useState(0);

  // Rotasi otomatis tiap 6 detik (jeda saat modal terbuka)
  useRotateCarousel(photos.length, selectedPhoto, setCurrent);

  const featured = photos.length > 0 ? photos[current % photos.length] : null;
  const sidePhotos = photos.length > 1 ? photos.filter((_, i) => i !== current % photos.length).slice(0, 2) : [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', overflowX: 'hidden', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(140,106,63,0.03) 22px, rgba(140,106,63,0.03) 44px)' }}>
      {/* Header sederhana senada halaman upload */}
      <header style={{ textAlign: 'center', padding: '32px 20px 8px 20px' }}>
        <p style={{ letterSpacing: '0.35em', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 8px 0' }}>— Galeri Kenangan —</p>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: '600', fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
          {eventCode.replace(/-/g, ' ')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
          {photos.length} karya terpajang · LIVE
        </p>
      </header>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>Dinding galeri masih kosong 🖼️</p>
          <p style={{ fontSize: '16px' }}>Tunggu tamu mulai memajang karyanya...</p>
        </div>
      ) : (
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', padding: '48px 32px' }}>
          {sidePhotos.map((photo, i) => (
            <SideFrame key={photo.id} photo={photo} onClick={() => setSelectedPhoto(photo)} small={i === 1} />
          ))}
          {featured && (
            <figure key={'featured-' + featured.id} className="gallery-featured-in" onClick={() => setSelectedPhoto(featured)} style={{ margin: 0, cursor: 'pointer', width: 'min(560px, 90vw)' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--accent-2)', borderRadius: 'var(--radius-sm)', boxShadow: '0 24px 60px rgba(0,0,0,0.3), inset 0 0 0 3px var(--accent)' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: '#111', boxShadow: 'inset 0 0 0 10px var(--bg-card)' }}>
                  <img src={featured.image_url} alt={`Karya ${featured.guest_name || 'tamu'}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: featured.status === 'pending' ? 'blur(14px) brightness(0.7)' : 'none' }} />
                  {featured.status === 'pending' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--accent-2)', padding: '10px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> MENUNGGU REVIEW</span>
                    </div>
                  )}
                </div>
              </div>
              <figcaption style={{ marginTop: '14px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', padding: '10px 28px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>{featured.guest_name || 'Tamu'}</p>
                  {featured.message && <p style={{ margin: '6px 0 0 0', fontSize: '15px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '420px' }}>“{featured.message}”</p>}
                </div>
              </figcaption>
            </figure>
          )}
        </main>
      )}

      {/* Modal zoom foto */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedPhoto(null)}>
          <div style={{ maxWidth: '860px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '14px', backgroundColor: 'var(--accent-2)', borderRadius: 'var(--radius-sm)', boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 0 0 2px var(--accent)' }}>
              <div style={{ backgroundColor: '#111', boxShadow: 'inset 0 0 0 8px var(--bg-card)', overflow: 'hidden' }}>
                <img src={selectedPhoto.image_url} alt={`Karya ${selectedPhoto.guest_name || 'tamu'}`} style={{ width: '100%', maxHeight: '68vh', objectFit: 'contain', display: 'block', backgroundColor: '#000' }} />
              </div>
            </div>
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '24px', color: 'var(--bg-card)', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>{selectedPhoto.guest_name || 'Tamu'}</p>
              {selectedPhoto.message && <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#d8cfc0', fontStyle: 'italic' }}>“{selectedPhoto.message}”</p>}
            </div>
          </div>
          <button onClick={() => setSelectedPhoto(null)} aria-label="Tutup" style={{ position: 'absolute', top: '24px', right: '24px', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={22} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes galleryFeaturedIn { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: none; } }
        .gallery-featured-in { animation: galleryFeaturedIn 0.9s ease-out both; }
        .gallery-side-frame:hover { transform: rotate(0deg) scale(1.03) !important; }
        .gallery-side-frame { transition: transform 0.3s ease; }
      `}</style>
    </div>
  );
}

function useRotateCarousel(count, paused, setCurrent) {
  useEffectSafe(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count, paused]);
}

// Import terpisah agar mudah dibaca
import { useEffect } from 'react';
function useEffectSafe(fn, deps) { useEffect(fn, deps); }

const SideFrame = ({ photo, onClick, small }) => (
  <figure className="gallery-side-frame" onClick={onClick} style={{ margin: 0, cursor: 'pointer', width: small ? 'min(220px, 30vw)' : 'min(260px, 34vw)', transform: `rotate(${small ? 1.2 : -1.2}deg)` }}>
    <div style={{ padding: '10px', backgroundColor: 'var(--accent-2)', borderRadius: 'var(--radius-sm)', boxShadow: '0 14px 32px rgba(0,0,0,0.25), inset 0 0 0 2px var(--accent)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#111', boxShadow: 'inset 0 0 0 6px var(--bg-card)' }}>
        <img src={photo.image_url} alt={`Karya ${photo.guest_name || 'tamu'}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: photo.status === 'pending' ? 'blur(10px) brightness(0.7)' : 'none' }} />
        {photo.status === 'pending' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--accent-2)', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> MENUNGGU</span>
          </div>
        )}
      </div>
    </div>
    <figcaption style={{ marginTop: '8px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>{photo.guest_name || 'Tamu'}</p>
    </figcaption>
  </figure>
);
