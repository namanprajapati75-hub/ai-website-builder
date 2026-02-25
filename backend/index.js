require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an award-winning creative director and senior frontend engineer. Your websites win Awwwards Site of the Day. You ALWAYS use premium animation libraries for buttery smooth, professional feel.

═══════════════════════════════════════
ABSOLUTE OUTPUT RULE
═══════════════════════════════════════
- Output ONLY raw HTML starting with <!DOCTYPE html>
- NO markdown, NO backticks, NO explanation
- All CSS in <style>, all JS in <script>

═══════════════════════════════════════
MANDATORY LIBRARIES — ALWAYS INCLUDE IN <head>
═══════════════════════════════════════
<!-- Lenis Smooth Scroll -->
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>

<!-- GSAP + ScrollTrigger (professional animations) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

<!-- Swiper (smooth sliders) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

INITIALIZE LENIS in <script> at bottom:
const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
gsap.registerPlugin(ScrollTrigger);
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

═══════════════════════════════════════
MANDATORY GSAP ANIMATIONS
═══════════════════════════════════════
ALL of these must be implemented:

1. PAGE LOAD — Hero entrance (run on DOMContentLoaded):
gsap.timeline()
  .from('.hero-badge', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' })
  .from('.hero-title', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
  .from('.hero-sub', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  .from('.hero-btns', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
  .from('.hero-image', { y: 60, opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out' }, '-=0.5')

2. SCROLL ANIMATIONS — Each section reveals smoothly:
gsap.utils.toArray('.feature-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
    y: 60, opacity: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out'
  });
});

3. NAVBAR — Shrink + blur on scroll
4. PARALLAX on hero image
5. COUNTER ANIMATION on stats section
6. CUSTOM CURSOR (for desktop)
7. MAGNETIC BUTTONS — CTA buttons have magnetic hover effect
8. TESTIMONIALS — Swiper slider
9. FLOATING ORBS ANIMATION
10. TEXT REVEAL — Section titles

═══════════════════════════════════════
REAL IMAGES — USE THESE URLS
═══════════════════════════════════════
- https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200
- https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200
- https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200
- https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800
- https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800
- https://i.pravatar.cc/80?img=1
- https://i.pravatar.cc/80?img=2
- https://i.pravatar.cc/80?img=5

═══════════════════════════════════════
UNIQUE COLOR PALETTES — PICK ONE
═══════════════════════════════════════
CYBERPUNK: bg:#03001C, surface:#07023A, accent:#BC13FE, accent2:#00FFFF
EMERALD:   bg:#020B08, surface:#041A10, accent:#00FF87, accent2:#60EFFF
SUNSET:    bg:#0D0208, surface:#1A0510, accent:#FF6B6B, accent2:#FFE66D
OCEAN:     bg:#000B1E, surface:#001233, accent:#4CC9F0, accent2:#7B2FBE
ROSE:      bg:#0D0608, surface:#1A0C10, accent:#FF2D78, accent2:#FF9A00

═══════════════════════════════════════
MANDATORY SECTIONS
═══════════════════════════════════════
1. NAVBAR — fixed, glass, logo + links + CTA + hamburger
2. HERO — full viewport, giant headline, real image, 2 CTAs, floating orbs
3. STATS — 4 numbers with counter animation
4. FEATURES — 6 cards with glassmorphism
5. PRODUCT SHOWCASE — large mockup with parallax
6. HOW IT WORKS — 3 steps
7. PRICING — 3 tiers, yearly/monthly toggle
8. TESTIMONIALS — Swiper slider
9. FAQ — smooth accordion
10. CTA — gradient section
11. FOOTER — 4 cols

OUTPUT: Only HTML starting with <!DOCTYPE html>`;

const EDIT_PROMPT = `You are an expert frontend engineer. Modify the provided HTML website exactly as instructed.

RULES:
- Return COMPLETE modified HTML starting with <!DOCTYPE html>
- Make ONLY the requested changes, keep all GSAP, Lenis, Swiper libraries intact
- Preserve all images, fonts, animations, and structure
- Zero markdown, zero backticks, zero explanation`;

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
function cleanHTML(raw) {
  let html = raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const di = html.search(/<!doctype html>/i);
  if (di > 0) html = html.substring(di);
  return html;
}

// ─────────────────────────────────────────────
// GENERATE — non-streaming (works on Vercel)
// ─────────────────────────────────────────────
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Prompt too short" });
    }

    console.log("⚡ Generate:", prompt.substring(0, 80));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.75,
      max_tokens: 8000,
      stream: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Build a stunning award-winning website for: ${prompt}\n\nUSE: Lenis smooth scroll, GSAP animations, GSAP ScrollTrigger, Swiper slider, custom cursor, magnetic buttons, parallax effects, real Unsplash images, pravatar.cc avatars.\nOutput ONLY HTML starting with <!DOCTYPE html>.`,
        },
      ],
    });

    const raw  = completion.choices?.[0]?.message?.content || "";
    const html = cleanHTML(raw);

    if (!html.toLowerCase().includes("<!doctype html")) {
      return res.status(500).json({ success: false, error: "AI returned invalid HTML. Try again." });
    }

    console.log("✅ Generate done:", html.length, "chars");
    return res.json({ success: true, html });

  } catch (err) {
    console.error("❌ Generate error:", err?.message);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
});

// ─────────────────────────────────────────────
// EDIT — non-streaming (works on Vercel)
// ─────────────────────────────────────────────
app.post("/edit", async (req, res) => {
  try {
    const { html, instruction } = req.body;
    if (!html || !instruction) {
      return res.status(400).json({ success: false, error: "Missing params" });
    }

    console.log("✏️ Edit:", instruction.substring(0, 80));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 8000,
      stream: false,
      messages: [
        { role: "system", content: EDIT_PROMPT },
        {
          role: "user",
          content: `Current HTML:\n\n${html}\n\n---\nEdit instruction: ${instruction}\nReturn complete modified HTML only.`,
        },
      ],
    });

    const raw    = completion.choices?.[0]?.message?.content || "";
    const edited = cleanHTML(raw);

    if (!edited.toLowerCase().includes("<!doctype html")) {
      return res.status(500).json({ success: false, error: "AI returned invalid HTML. Try again." });
    }

    console.log("✅ Edit done:", edited.length, "chars");
    return res.json({ success: true, html: edited });

  } catch (err) {
    console.error("❌ Edit error:", err?.message);
    return res.status(500).json({ success: false, error: err?.message || "Edit failed" });
  }
});

// ─────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────
app.get("/api/status", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? "✅ Found" : "❌ MISSING"}`);
});
