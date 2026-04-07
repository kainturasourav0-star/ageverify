# 🛡️ CryptoAge — Privacy-Preserving Age Verification

> **"Old enough? YES or NO. That's all. Nothing stored."**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Privacy: Zero-Data](https://img.shields.io/badge/Privacy-Zero--Data-green.svg)]()
[![ZKP: Groth16](https://img.shields.io/badge/ZKP-Groth16-purple.svg)]()

---

## 🚀 What is CryptoAge?

**CryptoAge** is a privacy-first age verification system that checks if someone is old enough (e.g., 18+) for age-restricted content — **without asking for their full ID or storing any sensitive information**.

- ✅ **No passport, no ID upload required**
- ✅ **No biometric data stored — ever**
- ✅ **Zero-Knowledge Proof ensures mathematical privacy**
- ✅ **Short-lived 60-second tokens — nothing to steal**
- ✅ **GDPR, COPPA & DSA compliant by design**

---

## 📁 Project Structure

```
ageverify/
├── index.html      # Interactive 7-slide pitch deck (open in any browser)
├── code.js         # Core code: on-device ML + ZKP + JWT token system
├── docs.md         # Project documentation one-pager
├── research.md     # Research notes, statistics, legal analysis
└── README.md       # You are here
```

---

## 🧠 How It Works

```
User Device                  ZKP Engine              Server
    │                            │                      │
    │── Blurred camera frame ──▶│                      │
    │   (image discarded)        │                      │
    │◀── Age estimate (local) ──│                      │
    │                            │                      │
    │── Private: age=23 ────────▶ Generate ZKP proof   │
    │                            │── Encrypted proof ──▶│
    │                            │   ("age ≥ 18")       │── Verify proof
    │                            │                      │── Issue 60s JWT
    │◀─────────────────────────────────────────────────│
    │         ✅ YES / 🚫 NO (token expires, nothing stored)
```

### Key Technologies

| Component | Technology |
|-----------|-----------|
| On-Device ML | AgeNet (ONNX.js), TensorFlow.js |
| Zero-Knowledge Proof | Groth16 via snarkjs + Circom |
| Ephemeral Token | HS256 JWT (60-second TTL) |
| Backend | Node.js + Express |
| Frontend | Vanilla JS + HTML5 |

---

## 🎞️ Pitch Deck

Open `index.html` in any browser to view the full 7-slide interactive pitch deck.

**Slides:**
1. 🛡️ Title — CryptoAge branding & core promise
2. 😰 Problem — Why current age gates are broken & invasive
3. 💡 Solution — Anonymous ML + ZKP approach
4. ⚙️ How It Works — 5-step technical flow diagram
5. 💻 Code — Syntax-highlighted ZKP + JWT snippet
6. 🌍 Impact — 6 industries + comparison table
7. 🚀 CTA — Roadmap, vision, what's built

**Navigation:** Arrow keys `← →`, click Prev/Next, or swipe on mobile.

---

## 📊 Key Research Data

| Metric | Value |
|--------|-------|
| Identity records breached (2023) | **3.2 billion** |
| Users who abandon ID-upload age gates | **67%** |
| Users comfortable with ZKP verification | **72%** |
| Average data breach cost | **$4.9 million** |
| Data stored per user by CryptoAge | **0 bytes** |

---

## ⚖️ Legal Compliance

| Regulation | Status |
|-----------|--------|
| GDPR (EU) | ✅ Compliant — no personal data |
| COPPA (US) | ✅ Compliant — no child data collected |
| DSA (EU Digital Services Act) | ✅ Model approach |
| UK Age Appropriate Design Code | ✅ Privacy by default |

---

## 🔭 Roadmap

- [ ] Browser extension for one-click site integration
- [ ] Open-source SDK for developers
- [ ] Mobile app (iOS/Android)
- [ ] Decentralized verification (blockchain credentials)
- [ ] Government ID ZKP alternative

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*🛡️ CryptoAge — Privacy is not a feature. It's the foundation.*
