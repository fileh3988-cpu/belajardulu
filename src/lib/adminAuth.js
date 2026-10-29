import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Autentikasi admin berbasis session token (httpOnly cookie).
 * Token = HMAC(secret, "role.exp") — ditandatangani di server,
 * tidak bisa dipalsukan tanpa ADMIN_SESSION_SECRET.
 */

const COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 jam

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!secret) {
    throw new Error(
      'ADMIN_SESSION_SECRET belum diisi. Tambahkan secret acak yang panjang ke .env.local'
    )
  }
  return secret
}

function sign(payload) {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

/**
 * Buat token sesi.
 * - role 'superadmin': akses semua event -> payload "superadmin.<exp>"
 * - role 'admin'     : akses HANYA satu event -> payload "admin.<eventCode>.<exp>"
 * eventCode ikut ditandatangani, sehingga tidak bisa diganti client.
 */
export function createSessionToken(role, eventCode = null) {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = role === 'superadmin' ? `${role}.${exp}` : `${role}.${eventCode}.${exp}`
  const sig = sign(payload)
  return `${payload}.${sig}`
}

/**
 * Verifikasi token; mengembalikan { role, eventCode } jika valid, selain itu null.
 * eventCode hanya terisi untuk role 'admin' (sesi magic-link, terikat 1 event).
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null
  const lastDot = token.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === token.length - 1) return null
  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  const expectedSig = sign(payload)
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null

  const segs = payload.split('.')
  const role = segs[0]
  const expStr = segs.at(-1)
  if (role !== 'superadmin' && role !== 'admin') return null
  if (role === 'admin' && segs.length !== 3) return null // wajib: admin.<eventCode>.<exp>
  if (role === 'superadmin' && segs.length !== 2) return null

  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return null

  const eventCode = role === 'admin' ? segs[1] : null
  if (role === 'admin' && !eventCode) return null
  return { role, eventCode }
}

/** Cookie attributes untuk Set-Cookie sesi admin. */
export function sessionCookieOptions(maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME, SESSION_MAX_AGE_SECONDS }

/**
 * Guard untuk Route Handler admin. Panggil di awal setiap handler sensitif.
 * Mengembalikan { role } jika terautentikasi, atau null.
 */
export function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const session = verifySessionToken(token)
  return session // null jika tidak valid
}

/** Mengembalikan { role } hanya jika superadmin; null selain itu. */
export function requireSuperAdmin(request) {
  const session = requireAdmin(request)
  if (!session) return null
  return session.role === 'superadmin' ? session : null
}

/** Helper untuk request dari cron job yang dilindungi CRON_SECRET. */
export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

/**
 * Guard per-event: memastikan sesi admin hanya mengakses event miliknya.
 * - superadmin     : bebas memilih eventCode (selalu lolos).
 * - admin (magic-link): HANYA boleh mengakses eventCode yang terikat di sesi.
 *
 * Mengembalikan session ({ role, eventCode }) jika boleh melanjutkan, atau null.
 * Jika `requestedEventCode` kosong dan pemanggil adalah admin magic-link,
 * sesi tetap dikembalikan — handler WAJIB memakai `forceEventCode` dari
 * hasil guard ini agar tidak bisa dipakai melihat semua event.
 */
export function requireAdminForEvent(request, requestedEventCode = null) {
  const session = requireAdmin(request)
  if (!session) return null
  if (session.role === 'superadmin') return session
  // Role 'admin' selalu punya eventCode (diverifikasi di verifySessionToken)
  if (requestedEventCode && requestedEventCode !== session.eventCode) return null
  return session
}
