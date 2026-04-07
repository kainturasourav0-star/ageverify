# 📄 CryptoAge — Project Documentation

**One-Pager | Privacy-Preserving Age Verification**

---

## Problem Statement

Every day, millions of users are forced to submit passports, driver's licenses, and facial scans just to access age-restricted content online. These systems store sensitive identity data in centralized databases — creating massive breach risks, GDPR liabilities, and user friction. Meanwhile, simple checkbox solutions (e.g., "Are you 18?") are trivially bypassed by minors.

**The core problem**: Current age verification fails on both ends — too invasive for adults, too weak to stop minors.

---

## Solution: CryptoAge

CryptoAge is a **privacy-first age verification system** that answers one question — *"Is this user old enough?"* — with a **YES or NO**, without collecting, transmitting, or storing any personal identity data.

### How it works (in 5 steps):

| Step | What happens | Privacy guarantee |
|------|-------------|-------------------|
| 1. Capture | User allows 1-second camera access | Frame blurred immediately on-device |
| 2. On-device ML | AgeNet ONNX model estimates age | Raw image discarded — stays on device |
| 3. ZKP generation | Cryptographic proof: "age ≥ 18" | Actual age never leaves the device |
| 4. Token issued | Server verifies proof, issues 60-sec JWT | No identity in token — expires automatically |
| 5. Result | ✅ YES or 🚫 NO | Nothing stored anywhere |

---

## Key Features

- 🔐 **Zero-Knowledge Proof** — Mathematically proves age threshold without revealing actual age
- 🤖 **On-Device ML** — Age estimation runs entirely in the browser (TF.js / ONNX.js)
- ⏱️ **Ephemeral Tokens** — JWT expires in 60 seconds; single-use; no replay possible
- 🗑️ **Zero Retention** — No name, no photo, no DOB ever stored
- 🌍 **Privacy Law Ready** — Compliant with GDPR, COPPA, DSA, UK AADC

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| On-device ML | AgeNet (ONNX.js), TensorFlow.js |
| ZKP Protocol | Groth16 via snarkjs, Circom circuits |
| Token | HS256 JWT, 60-second TTL |
| Backend | Node.js + Express |
| Frontend | Vanilla JS + HTML5 (no framework needed) |

---

## Impact

- **For users**: No more handing over passports. 3-second, frictionless verification.
- **For businesses**: Legal compliance without storing sensitive data. Massive breach-liability reduction.
- **For society**: Children better protected. Adults' privacy respected. Win-win.

### Competitive Advantage vs. Existing Solutions

| Feature | Traditional ID Upload | CryptoAge |
|---------|----------------------|-----------|
| User friction | High | Low |
| Data stored | Yes (breach risk) | None |
| GDPR compliant | Difficult | ✅ Yes |
| Works without an ID | No | ✅ Yes |
| Spoof-resistant | Yes | ✅ Yes (liveness detection) |

---

## Team & Vision

**Vision**: Make privacy-first age verification the global standard — open source, freely available, and impossible to exploit for surveillance.

**Next steps**:
1. Browser extension for one-click integration
2. Open-source SDK for developers
3. Partnership with EU regulatory bodies
4. Decentralized credential alternative (blockchain-based)

---

*CryptoAge — "Old Enough?" → YES or NO. That's all. That's everything.*
