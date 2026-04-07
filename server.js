/**
 * CryptoAge — Privacy-Preserving Age Verification
 * Node.js / Express Backend
 * 
 * Receives a ZKP-style proof (boolean signal), issues ephemeral JWT.
 * NO personal data ever received, logged, or stored.
 */

const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = 3000;

// Random secret per server session — tokens die with server restart
const JWT_SECRET = 'cryptoage-' + crypto.randomBytes(32).toString('hex');

// Audit log (anonymous only)
let auditLog = { pass: 0, fail: 0, startTime: Date.now() };

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // serves app.html, etc.

/* ─────────────────────────────────────────────────
   POST /api/verify
   Body: { proof: { ageAboveThreshold: boolean, nonce: string } }
   Returns: { ok, token? }
───────────────────────────────────────────────── */
app.post('/api/verify', (req, res) => {
  const { proof } = req.body || {};

  if (!proof || typeof proof.ageAboveThreshold !== 'boolean' || !proof.nonce) {
    return res.status(400).json({ ok: false, error: 'invalid_proof_format' });
  }

  if (!proof.ageAboveThreshold) {
    auditLog.fail++;
    console.log(`[${stamp()}] ❌ Verification FAILED  (no identity data logged)`);
    return res.status(403).json({ ok: false, error: 'age_requirement_not_met' });
  }

  // Issue ephemeral token — NO name, DOB, face, or any personal data
  const token = jwt.sign(
    { ok: true, v: 'cryptoage/v1' },   // payload contains NO personal info
    JWT_SECRET,
    { expiresIn: '60s', issuer: 'cryptoage', jwtid: crypto.randomUUID() }
  );

  auditLog.pass++;
  console.log(`[${stamp()}] ✅ Verification PASSED  — token issued (60s TTL)`);
  res.json({ ok: true, token });
});

/* ─────────────────────────────────────────────────
   POST /api/validate
   Body: { token: string }
   Returns: { valid, expiresIn? }
───────────────────────────────────────────────── */
app.post('/api/validate', (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ valid: false, error: 'no_token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'cryptoage' });
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    res.json({ valid: true, expiresIn });
  } catch (e) {
    res.status(403).json({ valid: false, error: e.name === 'TokenExpiredError' ? 'token_expired' : 'token_invalid' });
  }
});

/* ─────────────────────────────────────────────────
   GET /api/stats
   Returns anonymous audit counters only
───────────────────────────────────────────────── */
app.get('/api/stats', (req, res) => {
  res.json({
    verified: auditLog.pass,
    denied: auditLog.fail,
    uptime: Math.round((Date.now() - auditLog.startTime) / 1000) + 's',
    dataStored: '0 bytes'
  });
});

/* ─── Fallback: serve app.html for any unknown route ─── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

function stamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🛡️  CryptoAge Server — RUNNING         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n  App  →  http://localhost:${PORT}/app.html`);
  console.log(`  API  →  http://localhost:${PORT}/api/verify`);
  console.log('\n  Zero personal data logged. Ever.\n');
});
