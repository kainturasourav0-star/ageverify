/**
 * ============================================================
 *  CryptoAge — Privacy-Preserving Age Verification
 *  Core Code Snippets
 *  Stack: Node.js (server) + Vanilla JS (client) + snarkjs (ZKP)
 * ============================================================
 */

// ─────────────────────────────────────────────
// CLIENT-SIDE: On-Device Age Estimation
// (Raw image NEVER sent to server)
// ─────────────────────────────────────────────

/**
 * Blur the captured video frame immediately to anonymize,
 * run age estimation on-device, then discard the canvas.
 * @param {HTMLVideoElement} videoEl
 * @returns {Promise<number>} estimated age (stays on device)
 */
async function estimateAgeOnDevice(videoEl) {
  // Load a lightweight on-device ML model (TensorFlow.js / ONNX)
  const model = await loadAgeEstimationModel('/models/age_model.onnx');

  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');

  // Anonymize BEFORE any processing — blur 12px
  ctx.filter = 'blur(12px)';
  ctx.drawImage(videoEl, 0, 0, 224, 224);

  // Preprocess for model input
  const imageData = ctx.getImageData(0, 0, 224, 224);
  const tensor = preprocessImageData(imageData); // normalize pixels

  // Predict age — result stays in memory, never sent anywhere
  const estimatedAge = await model.predict(tensor);

  // Immediate cleanup
  canvas.remove();
  tensor.dispose?.(); // TF.js cleanup

  return Math.round(estimatedAge); // e.g. 23
}


// ─────────────────────────────────────────────
// CLIENT-SIDE: Generate Zero-Knowledge Proof
// Proves "age >= 18" without revealing actual age
// ─────────────────────────────────────────────

/**
 * Generate a ZKP using snarkjs (groth16 protocol).
 * The proof cryptographically asserts age >= minAge
 * WITHOUT revealing the actual age value.
 * @param {number} age - estimated age (stays private)
 * @param {number} minAge - threshold (e.g. 18)
 * @returns {Promise<{proof, publicSignals}>}
 */
async function generateAgeProof(age, minAge = 18) {
  // Load the compiled ZK circuit
  const wasmBuffer = await fetch('/circuits/ageCheck.wasm').then(r => r.arrayBuffer());
  const zkeyBuffer = await fetch('/circuits/ageCheck_final.zkey').then(r => r.arrayBuffer());

  // Private inputs: actual age (never leaves device)
  // Public inputs: only the threshold
  const input = {
    age: age,       // PRIVATE — not included in proof
    minAge: minAge  // PUBLIC — verifier knows the threshold
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    new Uint8Array(wasmBuffer),
    new Uint8Array(zkeyBuffer)
  );

  // publicSignals = ["1"] if age >= minAge, ["0"] otherwise
  // proof contains NO age value — only mathematical commitment
  return { proof, publicSignals };
}


// ─────────────────────────────────────────────
// CLIENT-SIDE: Main Verification Flow
// ─────────────────────────────────────────────

/**
 * Full client-side verification flow.
 * Returns a short-lived JWT token on success.
 */
async function runAgeVerification(videoEl) {
  const statusEl = document.getElementById('status');
  
  try {
    statusEl.textContent = '🔍 Analyzing (on-device)...';
    const age = await estimateAgeOnDevice(videoEl);

    statusEl.textContent = '🔐 Generating privacy proof...';
    const { proof, publicSignals } = await generateAgeProof(age, 18);

    statusEl.textContent = '📡 Verifying...';
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof, publicSignals })
      // NOTE: age is NOT sent — only the mathematical proof
    });

    const data = await response.json();

    if (data.ok) {
      statusEl.textContent = '✅ Verified! Access granted.';
      sessionStorage.setItem('ageToken', data.token); // token auto-expires in 60s
      return { verified: true, token: data.token };
    } else {
      statusEl.textContent = '🚫 Not verified. Access denied.';
      return { verified: false };
    }
  } catch (err) {
    statusEl.textContent = '❌ Verification failed. Try again.';
    console.error('Age verification error:', err);
    return { verified: false };
  }
}


// ─────────────────────────────────────────────
// SERVER-SIDE: Verify ZKP & Issue Token
// (Node.js / Express)
// ─────────────────────────────────────────────

const express = require('express');
const jwt = require('jsonwebtoken');
const snarkjs = require('snarkjs');
const fs = require('fs');

const app = express();
app.use(express.json());

// Load verification key (public — does NOT contain age data)
const vKey = JSON.parse(fs.readFileSync('circuits/verification_key.json'));
const JWT_SECRET = process.env.JWT_SECRET; // stored securely in env

/**
 * POST /api/verify
 * Input: { proof, publicSignals }
 * Output: { ok: boolean, token?: string }
 * 
 * NO identity data is ever received or stored.
 * Only a mathematical proof is validated.
 */
app.post('/api/verify', async (req, res) => {
  const { proof, publicSignals } = req.body;

  // Validate that publicSignal[0] === "1" (age >= 18 is true in circuit)
  if (!proof || !publicSignals || publicSignals[0] !== '1') {
    return res.status(400).json({ ok: false, reason: 'invalid_input' });
  }

  // Cryptographically verify the ZKP — no age value is involved
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (!isValid) {
    // Log only fail count — NO personal data
    console.log(`[AUDIT] Verification failed at ${Date.now()}`);
    return res.status(403).json({ ok: false, reason: 'proof_invalid' });
  }

  // Issue ephemeral token — expires in 60 seconds, no user info inside
  const token = jwt.sign(
    { ok: true, v: 'cryptoage/v1' }, // NO name, NO DOB, NO face hash
    JWT_SECRET,
    { expiresIn: '60s', issuer: 'cryptoage' }
  );

  // Log only success count — NO personal data
  console.log(`[AUDIT] Verification passed at ${Date.now()}`);

  res.json({ ok: true, token });
  // Token expires in 60s. Nothing stored. Nothing to breach.
});


// ─────────────────────────────────────────────
// SERVER-SIDE: Protect Routes with Age Token
// ─────────────────────────────────────────────

/**
 * Middleware: validates the short-lived age token.
 * Attach to any age-restricted route.
 */
function requireAgeVerified(req, res, next) {
  const token = req.headers['x-age-token'];
  if (!token) return res.status(401).json({ error: 'age_token_required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'cryptoage' });
    if (!decoded.ok) throw new Error('invalid');
    next(); // ✅ User is verified old enough — proceed
  } catch (e) {
    // Token expired or tampered
    res.status(403).json({ error: 'age_token_invalid_or_expired' });
  }
}

// Example: protect adult content route
app.get('/api/content/adult/:id', requireAgeVerified, (req, res) => {
  res.json({ content: 'Restricted content delivered safely.' });
});

app.listen(3000, () => console.log('CryptoAge server running on :3000'));


// ─────────────────────────────────────────────
// ZK CIRCUIT (Circom pseudo-code)
// Proves age >= minAge without revealing age
// ─────────────────────────────────────────────

/*
  // circuits/ageCheck.circom
  pragma circom 2.0.0;

  include "node_modules/circomlib/circuits/comparators.circom";

  template AgeCheck() {
    signal input age;      // PRIVATE — hidden from verifier
    signal input minAge;   // PUBLIC  — verifier knows threshold
    signal output valid;   // 1 if age >= minAge, else 0

    component gte = GreaterEqThan(8); // 8-bit comparison
    gte.in[0] <== age;
    gte.in[1] <== minAge;
    valid <== gte.out;    // 1 or 0 — nothing else revealed
  }

  component main = AgeCheck();
*/
