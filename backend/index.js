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
- CRITICAL: You MUST always end the response with </script></body></html> — never cut off mid-generation
- If you are running low on space, skip optional sections but ALWAYS close the document properly

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
// Apply same pattern to: .testimonial-card, .pricing-card, .step-item, .section-title

3. NAVBAR — Shrink + blur on scroll:
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    navbar.style.padding = self.progress > 0 ? '10px 40px' : '20px 40px';
    navbar.style.background = self.progress > 0 ? 'rgba(bg-color, 0.95)' : 'transparent';
    navbar.style.backdropFilter = self.progress > 0 ? 'blur(20px)' : 'none';
    navbar.style.borderBottom = self.progress > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none';
  }
});

4. PARALLAX on hero image:
gsap.to('.hero-image', {
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
  y: 100, ease: 'none'
});

5. COUNTER ANIMATION on stats section:
gsap.from('.stat-number', {
  scrollTrigger: { trigger: '.stats', start: 'top 80%' },
  textContent: 0,
  duration: 2,
  ease: 'power2.out',
  snap: { textContent: 1 },
  stagger: 0.2
});

6. CUSTOM CURSOR (for desktop):
Create a custom cursor div:
<div class="cursor-dot"></div>
<div class="cursor-outline"></div>

CSS:
.cursor-dot { width:8px;height:8px;background:ACCENT;border-radius:50%;position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform 0.1s; }
.cursor-outline { width:36px;height:36px;border:2px solid ACCENT;border-radius:50%;position:fixed;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all 0.15s ease;opacity:0.6; }

JS:
let cursorDot = document.querySelector('.cursor-dot');
let cursorOutline = document.querySelector('.cursor-outline');
let mouseX=0,mouseY=0,outX=0,outY=0;
window.addEventListener('mousemove', e => { mouseX=e.clientX; mouseY=e.clientY; cursorDot.style.left=mouseX+'px'; cursorDot.style.top=mouseY+'px'; });
gsap.ticker.add(() => { outX+=(mouseX-outX)*0.12; outY+=(mouseY-outY)*0.12; cursorOutline.style.left=outX+'px'; cursorOutline.style.top=outY+'px'; });
document.querySelectorAll('a,button,.chip,.card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursorOutline.style.width='60px'; cursorOutline.style.height='60px'; cursorDot.style.transform='translate(-50%,-50%) scale(1.5)'; });
  el.addEventListener('mouseleave', () => { cursorOutline.style.width='36px'; cursorOutline.style.height='36px'; cursorDot.style.transform='translate(-50%,-50%) scale(1)'; });
});

7. MAGNETIC BUTTONS — CTA buttons have magnetic hover effect:
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    gsap.to(btn, { x: x*0.3, y: y*0.3, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => { gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.5)' }); });
});

8. TESTIMONIALS — Swiper slider:
new Swiper('.testimonials-swiper', {
  slidesPerView: 1, spaceBetween: 30, loop: true, autoplay: { delay: 4000, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
});

9. FLOATING ORBS ANIMATION:
gsap.to('.orb-1', { y: -40, x: 20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
gsap.to('.orb-2', { y: 30, x: -30, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });

10. TEXT REVEAL — Section titles split and animate in:
.section-title { overflow: hidden; }
.section-title span { display: inline-block; transform: translateY(100%); animation triggers on scroll }

═══════════════════════════════════════
REAL IMAGES — USE THESE URLS
═══════════════════════════════════════
Unsplash photos (use based on topic):
- https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200 (AI abstract)
- https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200 (AI robot)
- https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200 (globe tech)
- https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800 (coding)
- https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800 (analytics dashboard)
- https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800 (startup office)
- https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800 (finance charts)

Testimonial avatars (use these exact URLs):
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
UNIQUE FONT COMBOS — PICK ONE
═══════════════════════════════════════
A: @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap')
B: @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@300;400;500&display=swap')
C: @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@300;400;500&display=swap')
D: @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap')

═══════════════════════════════════════
MANDATORY SECTIONS
═══════════════════════════════════════
1. NAVBAR — fixed, glass, logo + links + CTA + hamburger
2. HERO — full viewport, giant headline, real image, 2 CTAs, floating orbs
3. STATS — 4 numbers with counter animation (10K+, 99%, etc)
4. FEATURES — 6 cards with glassmorphism + gradient border on hover
5. PRODUCT SHOWCASE — large mockup in device frame with parallax
6. HOW IT WORKS — 3 steps with GSAP scroll animations
7. PRICING — 3 tiers, yearly/monthly toggle, Pro card glowing
8. TESTIMONIALS — Swiper slider with real avatars
9. FAQ — smooth accordion
10. CTA — gradient section
11. FOOTER — 4 cols

OUTPUT: Only HTML starting with <!DOCTYPE html>
`;

const EDIT_PROMPT = `You are an expert frontend engineer. Modify the provided HTML website exactly as instructed.

RULES:
- Return COMPLETE modified HTML starting with <!DOCTYPE html>
- Make ONLY the requested changes, keep all GSAP, Lenis, Swiper libraries intact
- Preserve all images, fonts, animations, and structure
- Zero markdown, zero backticks, zero explanation`;

// ─────────────────────────────────────────────
// HELPER — clean & validate HTML
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

function isHTMLComplete(html) {
  return (
    html.toLowerCase().includes("<!doctype html") &&
    html.toLowerCase().includes("</html>")
  );
}

// Try to auto-repair truncated HTML by closing open tags
function repairHTML(html) {
  let repaired = html.trim();

  // If </body> missing but </html> also missing — add both
  if (!repaired.toLowerCase().includes("</body>")) {
    // Close any open script tag first
    const openScript = (repaired.match(/<script/gi) || []).length > (repaired.match(/<\/script>/gi) || []).length;
    if (openScript) repaired += "\n</script>";
    repaired += "\n</body>";
  }
  if (!repaired.toLowerCase().includes("</html>")) {
    repaired += "\n</html>";
  }

  return repaired;
}

// ─────────────────────────────────────────────
// GENERATE (streaming)
// ─────────────────────────────────────────────
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Prompt too short" });
    }

    console.log("⚡ Generate:", prompt.substring(0, 80));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.75,
      max_tokens: 32000,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Build a stunning award-winning website for: ${prompt}\n\nUSE: Lenis smooth scroll, GSAP animations, GSAP ScrollTrigger, Swiper slider, custom cursor, magnetic buttons, parallax effects, real Unsplash images, pravatar.cc avatars.\nOutput ONLY HTML starting with <!DOCTYPE html>. Make sure the HTML is COMPLETE — always end with </body></html>.`,
        },
      ],
    });

    let full = "";

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      full += delta;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`);
    }

    const html = cleanHTML(full);

    // ✅ Incomplete HTML check — try to repair before erroring
    if (!isHTMLComplete(html)) {
      console.warn("⚠️ Truncated HTML detected — attempting repair");
      const repaired = repairHTML(html);
      if (isHTMLComplete(repaired)) {
        console.log("✅ HTML repaired successfully");
        res.write(`data: ${JSON.stringify({ type: "done", html: repaired, warning: "Response was partially truncated but auto-repaired." })}\n\n`);
      } else {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: "Response was cut off and could not be repaired. Try a simpler/shorter prompt.",
          })}\n\n`
        );
      }
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ type: "done", html })}\n\n`);
    res.end();
    console.log("✅ Generate done:", html.length, "chars");

  } catch (err) {
    console.error("❌ Generate error:", err?.message);
    res.write(
      `data: ${JSON.stringify({ type: "error", message: err?.message || "Server error" })}\n\n`
    );
    res.end();
  }
});

// ─────────────────────────────────────────────
// EDIT (streaming)
// ─────────────────────────────────────────────
app.post("/edit", async (req, res) => {
  try {
    const { html, instruction } = req.body;
    if (!html || !instruction) {
      return res.status(400).json({ success: false, error: "Missing params" });
    }

    console.log("✏️ Edit:", instruction.substring(0, 80));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 32000,
      stream: true,
      messages: [
        { role: "system", content: EDIT_PROMPT },
        {
          role: "user",
          content: `Current HTML:\n\n${html}\n\n---\nEdit instruction: ${instruction}\nReturn complete modified HTML only. Always end with </body></html>.`,
        },
      ],
    });

    let full = "";

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      full += delta;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`);
    }

    const edited = cleanHTML(full);

    // ✅ Incomplete HTML check — try to repair before erroring
    if (!isHTMLComplete(edited)) {
      console.warn("⚠️ Truncated edit HTML detected — attempting repair");
      const repaired = repairHTML(edited);
      if (isHTMLComplete(repaired)) {
        console.log("✅ Edit HTML repaired successfully");
        res.write(`data: ${JSON.stringify({ type: "done", html: repaired, warning: "Response was partially truncated but auto-repaired." })}\n\n`);
      } else {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: "Edit response was cut off and could not be repaired. Try a simpler edit instruction.",
          })}\n\n`
        );
      }
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ type: "done", html: edited })}\n\n`);
    res.end();
    console.log("✅ Edit done:", edited.length, "chars");

  } catch (err) {
    console.error("❌ Edit error:", err?.message);
    res.write(
      `data: ${JSON.stringify({ type: "error", message: err?.message || "Edit failed" })}\n\n`
    );
    res.end();
  }
});

// ─────────────────────────────────────────────
// MISC ROUTES
// ─────────────────────────────────────────────
app.get("/api/status", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? "✅ Found" : "❌ MISSING — add to .env"}`);
});
