'use client';
import { Upload, Camera, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// ============================================================
// GALLERY LAYOUT — halaman upload (/e/...) untuk tema Gallery.
// Dinding galeri klasik: foto berbingkai emas + plakat nama,
// warna & font diambil dari CSS variable [data-theme="gallery"]
// sehingga SENADA dengan GalleryDisplay di layar besar.
// ============================================================
export default function GalleryLayout(props) {
  const {
    eventCode, communityPhotos, handleSubmit, formRef, loading, status, statusType,
    filePreview, fileName, setFilePreview, setFileName, startCamera,
    previewPhoto, setPreviewPhoto, isRealtimeConnected
  } = props;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', overflowX: 'hidden', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(140,106,63,0.03) 22px, rgba(140,106,63,0.03) 44px)' }}>

      {/* === HEADER GALERI === */}
      <header className="animate-fade-in" style={{ textAlign: 'center', padding: '48px 20px 24px 20px' }}>
        <p style={{ letterSpacing: '0.35em', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 12px 0' }}>— Galeri Kenangan —</p>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: '600', color: 'var(--text-main)', marginBottom: '10px', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>{eventCode.replace(/-/g, ' ')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          Tap lukisan untuk melihat detail
          {communityPhotos.length > 0 && <> · <strong>{communityPhotos.length}</strong> karya terpajang</>}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px', padding: '5px 14px', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: isRealtimeConnected ? '#166534' : '#991b1b', backgroundColor: isRealtimeConnected ? '#dcfce7' : '#fee2e2' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isRealtimeConnected ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
          {isRealtimeConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </header>

      {/* === DINDING GALERI === */}
      <section style={{ padding: '24px 20px 48px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        {communityPhotos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', margin: '0 auto' }}>
            <p style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontStyle: 'italic', margin: '0 0 8px 0' }}>Dinding ini masih kosong</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Jadilah tamu pertama yang memajang karyanya 🖼️</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px' }}>
            {communityPhotos.map((photo, index) => (
              <figure key={photo.id} onClick={() => setPreviewPhoto(photo)} className="gallery-frame" style={{ margin: 0, cursor: 'pointer', transform: `rotate(${index % 2 === 0 ? -0.6 : 0.6}deg)` }}>
                {/* Bingkai ganda khas museum */}
                <div style={{ padding: '10px', backgroundColor: 'var(--accent-2)', borderRadius: 'var(--radius-sm)', boxShadow: '0 10px 24px rgba(0,0,0,0.25), inset 0 0 0 2px var(--accent)' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: '#111', boxShadow: 'inset 0 0 0 6px var(--bg-card)' }}>
                    <img src={photo.image_url} alt={`Karya ${photo.guest_name || 'tamu'}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: photo.status === 'pending' ? 'blur(12px) brightness(0.7)' : 'none' }} />
                    {photo.status === 'pending' && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--accent-2)', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> MENUNGGU REVIEW</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Plakat kuningan */}
                <figcaption style={{ marginTop: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{photo.guest_name || 'Tamu'}</p>
                    {photo.message && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>“{photo.message}”</p>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* === FORM UPLOAD (kartu kurator) === */}
      <section style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px 72px 20px' }}>
        <div ref={formRef} style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(74,59,42,0.12)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0', textAlign: 'center', fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>Pajang Karya Anda</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', margin: '0 0 20px 0' }}>Kurasi galeri bersama para tamu lainnya</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" name="guestName" required placeholder="Nama Anda..." style={{ width: '100%', padding: '13px 16px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
            {filePreview && (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={filePreview} alt="Pratinjau foto" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', backgroundColor: 'var(--bg-main)' }} />
                <button type="button" onClick={() => { setFilePreview(''); setFileName(''); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button type="button" onClick={startCamera} style={{ padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Camera size={20} /> <span style={{ fontSize: '12px' }}>Kamera</span>
              </button>
              <label style={{ padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Upload size={20} /> <span style={{ fontSize: '12px' }}>Galeri</span>
                <input type="file" name="file" accept="image/*" required={!filePreview} style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFileName(file.name);
                    const reader = new FileReader();
                    reader.onloadend = () => setFilePreview(reader.result);
                    reader.readAsDataURL(file);
                    window.__cameraFile = null;
                  }
                }} />
              </label>
            </div>
            <textarea name="message" placeholder="Judul atau pesan (opsional)..." rows="2" style={{ width: '100%', padding: '13px 16px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'none', fontSize: '15px', fontFamily: 'inherit', boxSizing: 'border-box' }}></textarea>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.05em' }}>
              {loading ? 'Memajang...' : 'Pajang di Galeri 🖼️'}
            </button>
          </form>
          {status && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '14px', backgroundColor: statusType === 'success' ? '#dcfce7' : '#fee2e2', color: statusType === 'success' ? '#166534' : '#991b1b' }}>
              {status}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .gallery-frame:hover { transform: scale(1.02) !important; transition: transform 0.25s ease; }
        .gallery-frame { transition: transform 0.25s ease; }
      `}</style>
    </div>
  );
}

void CheckCircle2; void AlertCircle; // reserved, dipakai via getStatusConfig bila perlu
