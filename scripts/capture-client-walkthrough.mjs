/**
 * Capture annotated Ambuhub client walkthrough screenshots (signup → hire ambulance).
 * Run from frontend root:
 *   node scripts/capture-client-walkthrough.mjs
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, "../../ambuhub-backend");
const requireBackend = createRequire(path.join(BACKEND_ROOT, "package.json"));
const dotenv = requireBackend("dotenv");
const mongoose = requireBackend("mongoose");
const bcrypt = requireBackend("bcrypt");

dotenv.config({ path: path.join(BACKEND_ROOT, ".env") });

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
const OUT_DIR = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-Adriel-Desktop-projects-Ambuhub",
  "assets",
  "walkthrough",
);
const DEMO_EMAIL = `walkthrough.client.${Date.now()}@ambuhub.test`;
const DEMO_PASSWORD = "Walkthrough1!";

async function ensureDemoClient() {
  const uri = process.env.DB_URI;
  const dbName = process.env.DB_NAME || "ambuhub";
  if (!uri) throw new Error("DB_URI missing");

  await mongoose.connect(uri, { dbName });
  const users = mongoose.connection.db.collection("users");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();
  await users.updateOne(
    { email: DEMO_EMAIL },
    {
      $set: {
        firstName: "Ada",
        lastName: "Okoro",
        email: DEMO_EMAIL,
        phone: "08030000001",
        countryCode: "NG",
        password: hash,
        role: "client",
        emailVerified: true,
        isSuspended: false,
        dateOfBirth: new Date("1995-05-12"),
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now, favoriteServiceIds: [] },
    },
    { upsert: true },
  );
  await mongoose.disconnect();
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

async function addArrowOverlay(page, selector, label) {
  await page.evaluate(
    ({ selector, label }) => {
      document.getElementById("__walkthrough_overlay__")?.remove();
      const el = document.querySelector(selector);
      if (!el) return;
      el.scrollIntoView({ block: "center", inline: "center" });
      const rect = el.getBoundingClientRect();
      const root = document.createElement("div");
      root.id = "__walkthrough_overlay__";
      root.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";

      const ring = document.createElement("div");
      ring.style.cssText = `
        position:fixed;
        left:${rect.left - 6}px;
        top:${rect.top - 6}px;
        width:${rect.width + 12}px;
        height:${rect.height + 12}px;
        border:3px solid #dc2626;
        border-radius:14px;
        box-shadow:0 0 0 4px rgba(220,38,38,0.25);
      `;
      root.appendChild(ring);

      const calloutTop = Math.max(16, rect.top - 72);
      const calloutLeft = Math.min(
        window.innerWidth - 300,
        Math.max(16, rect.left),
      );
      const callout = document.createElement("div");
      callout.style.cssText = `
        position:fixed;
        left:${calloutLeft}px;
        top:${calloutTop}px;
        max-width:280px;
        background:#dc2626;
        color:white;
        font:700 14px/1.35 system-ui,sans-serif;
        padding:10px 12px;
        border-radius:10px;
        box-shadow:0 8px 24px rgba(0,0,0,0.25);
      `;
      callout.textContent = label;
      root.appendChild(callout);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute(
        "style",
        "position:fixed;inset:0;width:100%;height:100%;overflow:visible;",
      );
      const x1 = calloutLeft + 40;
      const y1 = calloutTop + 40;
      const x2 = rect.left + rect.width / 2;
      const y2 = rect.top - 2;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.setAttribute("stroke", "#dc2626");
      line.setAttribute("stroke-width", "4");
      svg.appendChild(line);
      const tip = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      );
      tip.setAttribute(
        "points",
        `${x2},${y2} ${x2 - 10},${y2 - 18} ${x2 + 10},${y2 - 18}`,
      );
      tip.setAttribute("fill", "#dc2626");
      svg.appendChild(tip);
      root.appendChild(svg);
      document.body.appendChild(root);
    },
    { selector, label },
  );
  await page.waitForTimeout(200);
}

async function clearOverlay(page) {
  await page.evaluate(() => {
    document.getElementById("__walkthrough_overlay__")?.remove();
  });
}

async function shot(page, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
  return file;
}

async function mark(locator, attr) {
  await locator.evaluate(
    (el, value) => el.setAttribute("data-walkthrough", value),
    attr,
  );
  return `[data-walkthrough="${attr}"]`;
}

async function main() {
  console.log("Preparing demo client…");
  const creds = await ensureDemoClient();
  console.log("Demo client ready");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 01 — Auth landing
  await page.goto(`${FRONTEND}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const signupBtn = page.getByRole("button", { name: /^sign up$/i }).first();
  await signupBtn.waitFor({ state: "visible", timeout: 20000 });
  const signupSel = await mark(signupBtn, "signup-cta");
  await addArrowOverlay(page, signupSel, "1. Click Sign up");
  await shot(page, "01-auth-signup.png");
  await clearOverlay(page);
  await signupBtn.click();
  await page.waitForTimeout(1000);

  // 02 — Choose client
  const clientBtn = page.getByRole("button", { name: /i.?m a client/i }).first();
  await clientBtn.waitFor({ state: "visible", timeout: 20000 });
  const clientSel = await mark(clientBtn, "client-role");
  await addArrowOverlay(page, clientSel, "2. Choose I'm a client");
  await shot(page, "02-choose-client.png");
  await clearOverlay(page);
  await clientBtn.click();
  await page.waitForTimeout(1000);

  // 03 — Signup form
  const createBtn = page
    .getByRole("button", { name: /create account/i })
    .first();
  await createBtn.waitFor({ state: "visible", timeout: 20000 });
  const createSel = await mark(createBtn, "create-account");
  await addArrowOverlay(
    page,
    createSel,
    "3. Fill the form, then Create account",
  );
  await shot(page, "03-signup-form.png");
  await clearOverlay(page);

  // 04 — Sign in with prepared client (skip OTP)
  await page.goto(`${FRONTEND}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').first().fill(creds.email);
  await page.locator('input[type="password"]').first().fill(creds.password);
  const signInBtn = page.getByRole("button", { name: /^sign in$/i }).first();
  const signInSel = await mark(signInBtn, "sign-in");
  await addArrowOverlay(
    page,
    signInSel,
    "Already registered? Sign in here",
  );
  await shot(page, "04-sign-in.png");
  await clearOverlay(page);
  await signInBtn.click();
  await page.waitForURL(/\/client\//, { timeout: 45000 });
  await page.waitForTimeout(1500);

  // 05 — Dashboard
  const browse = page
    .getByRole("link", { name: /browse marketplace/i })
    .first();
  await browse.waitFor({ state: "visible", timeout: 30000 });
  const browseSel = await mark(browse, "browse-mkt");
  await addArrowOverlay(page, browseSel, "4. Open Browse marketplace");
  await shot(page, "05-client-dashboard.png");
  await clearOverlay(page);
  await browse.click();
  await page.waitForURL(/\/services\/medical-transport/, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // 06 — Listings
  // Scroll seeded listing into view when present
  const seeded = page.locator("text=Mercedes Sprinter BLS").first();
  if ((await seeded.count()) > 0) {
    await seeded.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  const hireLink = page.getByRole("link", { name: /^hire now$/i }).first();
  await hireLink.waitFor({ state: "visible", timeout: 45000 });
  await hireLink.scrollIntoViewIfNeeded();
  const hireSel = await mark(hireLink, "hire-now");
  await addArrowOverlay(
    page,
    hireSel,
    "5. Click Hire now on a ground ambulance",
  );
  await shot(page, "06-medical-transport-listings.png");
  await clearOverlay(page);
  await hireLink.click();
  await page.waitForURL(/\/hire\//, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // 07 — Hire detail
  const payBtn = page
    .locator(
      'button:has-text("Pay with Paystack"), button:has-text("Pay"), button:has-text("Confirm hire"), button:has-text("Continue")',
    )
    .first();
  await payBtn.waitFor({ state: "visible", timeout: 45000 });
  await payBtn.scrollIntoViewIfNeeded();
  const paySel = await mark(payBtn, "pay-cta");
  await addArrowOverlay(
    page,
    paySel,
    "6. Choose dates, then complete payment to hire",
  );
  await shot(page, "07-hire-ambulance.png");
  await clearOverlay(page);

  await browser.close();
  console.log("\nWalkthrough screenshots:");
  console.log(OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
