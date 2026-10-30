'use client';
import { useState, useEffect } from 'react';
import { Upload, Camera, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function JemuranLayout(props) {
  // Welcome screen sengaja DIHILANGKAN agar konsisten dengan tema lain
  // (zero-flash: konten langsung tampil mengikuti tema dari server).
  const {
    eventCode, communityPhotos, myPhotos, handleSubmit, formRef, loading, status, statusType,
    filePreview, fileName, setFilePreview, setFileName, startCamera, showCamera, videoRef,
    capturePhoto, switchCamera, facingMode, isCameraReady, cameraError, stopCamera,
    previewPhoto, setPreviewPhoto, handleRemovePhoto, isRealtimeConnected
  } = props;

  const getStatusConfig = (status) => {
    if (status === 'approved') return { label: 'Diterima', icon: CheckCircle2, bg: 'var(--accent-2)', color: '#fff' };
    if (status === 'rejected') return { label: 'Ditolak', icon: AlertCircle, bg: '#9ca3af', color: '#fff' };
    return { label: 'Menunggu', icon: Clock, bg: 'var(--accent)', color: '#fff' };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      
      {/* === HEADER === */}
      <header className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px 20px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: isRealtimeConnected ? '#dcfce7' : '#fee2e2', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: isRealtimeConnected ? '#166534' : '#991b1b', marginBottom: '16px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isRealtimeConnected ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
          {isRealtimeConnected ? 'LIVE · FOTO LANGSUNG TERGANTUNG' : 'OFFLINE · SEGARKAN HALAMAN'}
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{eventCode.replace(/-/g, ' ')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          {'👕 Jemuran Kenangan — tap foto untuk melihat besar'}
          {communityPhotos.length > 0 && <> · <strong>{communityPhotos.length}</strong> foto tergantung</>}
        </p>
      </header>

      {/* === JEMURAN AREA === */}
      <div style={{ position: 'relative', padding: '60px 0', marginBottom: '40px' }}>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ position: 'absolute', top: '14px', left: 0, width: '100%', height: '48px', zIndex: 0 }} aria-hidden="true">
          <path d="M0 10 Q 300 55 600 30 T 1200 12" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
        </svg>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 20px', gap: '24px', scrollSnapType: 'x mandatory', zIndex: 1, position: 'relative' }}>
          {communityPhotos.length === 0 ? (
            <div style={{ width: '100%', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>Belum ada foto yang tergantung 🪢</p>
              <p style={{ fontSize: '14px' }}>Jadilah yang pertama!</p>
            </div>
          ) : (
            communityPhotos.map((photo, index) => {
              const sc = getStatusConfig(photo.status);
              const StatusIcon = sc.icon;
              return (
                <div key={photo.id} onClick={() => setPreviewPhoto(photo)} className="jemuran-card" style={{ 
                  flex: '0 0 auto', width: '140px', backgroundColor: 'var(--bg-card)', padding: '8px 8px 24px 8px', borderRadius: 'var(--radius-sm)', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative', transformOrigin: 'top center',
                  animation: `sway ${3 + (index % 3)}s ease-in-out infinite`, animationDelay: `${index * 0.5}s`,
                  cursor: 'pointer', scrollSnapAlign: 'center'
                }}>
                  <div style={{ position: 'absolute', top: '-32px', left: '50%', width: '2px', height: '32px', backgroundColor: 'var(--text-muted)', opacity: 0.7 }}></div>
                  <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-6deg)', width: '14px', height: '26px', backgroundColor: 'var(--accent)', borderRadius: '4px', opacity: 0.9, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                  <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', overflow: 'hidden', marginBottom: '8px' }}>
                    <img src={photo.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'cursive', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photo.guest_name}</p>
                  {photo.status === 'pending' && (
                    <div style={{ position: 'absolute', inset: '8px 8px 24px 8px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} color="var(--accent)" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* === FORM UPLOAD === */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <div ref={formRef} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>📸 Upload Foto</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" name="guestName" required placeholder="Nama Anda..." style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none' }} />
            {filePreview && (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                <img src={filePreview} alt="Pratinjau foto" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }} />
                <button type="button" onClick={() => { setFilePreview(''); setFileName(''); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button type="button" onClick={startCamera} style={{ padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Camera size={20} /> <span style={{ fontSize: '12px' }}>Kamera</span>
              </button>
              <label style={{ padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
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
            <textarea name="message" placeholder="Pesan (opsional)..." rows="2" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none', resize: 'none' }}></textarea>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Mengupload...' : 'Gantung Foto 🪢'}
            </button>
          </form>
          {status && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', backgroundColor: statusType === 'success' ? '#dcfce7' : '#fee2e2', color: statusType === 'success' ? '#166534' : '#991b1b' }}>
              {status}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sway { 0% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } 100% { transform: rotate(-3deg); } }
        .jemuran-card:hover { filter: brightness(1.04); }
        div::-webkit-scrollbar { display: none; }
        div { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}