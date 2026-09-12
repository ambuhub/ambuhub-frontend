/**
 * Re-capture steps 06–07 targeting ground ambulances (NGN hire).
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
const HIRE_ID = "6aa52d5397b1fe31b35d88ef"; // Mercedes Sprinter BLS — Lagos
const DEMO_EMAIL = `walkthrough.ground.${Date.now()}@ambuhub.test`;
const DEMO_PASSWORD = "Walkthrough1!";

async function ensureDemoClient() {
  await mongoose.connect(process.env.DB_URI, {
    dbName: process.env.DB_NAME || "ambuhub",
  });
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
      ring.style.cssText = `position:fixed;left:${rect.left - 6}px;top:${rect.top - 6}px;width:${rect.width + 12}px;height:${rect.height + 12}px;border:3px solid #dc2626;border-radius:14px;box-shadow:0 0 0 4px rgba(220,38,38,0.25);`;
      root.appendChild(ring);
      const calloutTop = Math.max(16, rect.top - 72);
      const calloutLeft = Math.min(window.innerWidth - 300, Math.max(16, rect.left));
      const callout = document.createElement("div");
      callout.style.cssText = `position:fixed;left:${calloutLeft}px;top:${calloutTop}px;max-width:280px;background:#dc2626;color:white;font:700 14px/1.35 system-ui,sans-serif;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.25);`;
      callout.textContent = label;
      root.appendChild(callout);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:fixed;inset:0;width:100%;height:100%;overflow:visible;");
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
      const tip = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      tip.setAttribute("points", `${x2},${y2} ${x2 - 10},${y2 - 18} ${x2 + 10},${y2 - 18}`);
      tip.setAttribute("fill", "#dc2626");
      svg.appendChild(tip);
      root.appendChild(svg);
      document.body.appendChild(root);
    },
    { selector, label },
  );
  await page.waitForTimeout(250);
}

async function clearOverlay(page) {
  await page.evaluate(() =>
    document.getElementById("__walkthrough_overlay__")?.remove(),
  );
}

async function shot(page, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
}

async function main() {
  await ensureDemoClient();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Login
  await page.goto(`${FRONTEND}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.locator('input[type="email"]').first().fill(DEMO_EMAIL);
  await page.locator('input[type="password"]').first().fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /^sign in$/i }).first().click();
  await page.waitForURL(/\/client\//, { timeout: 45000 });

  // Listings filtered to ground ambulance
  await page.goto(`${FRONTEND}/services/medical-transport`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);
  const dept = page.locator("#department-filter");
  await dept.waitFor({ state: "visible", timeout: 30000 });
  // Select option containing Ground
  const options = await dept.locator("option").allTextContents();
  const groundOpt = options.find((t) => /ground/i.test(t));
  if (groundOpt) {
    await dept.selectOption({ label: groundOpt.trim() });
  } else {
    // fallback: search
    await page.locator('input[placeholder*="Search"], input[type="search"]').first().fill("Mercedes Sprinter");
  }
  await page.waitForTimeout(1500);

  const title = page.locator("text=Mercedes Sprinter BLS").first();
  if ((await title.count()) > 0) {
    await title.scrollIntoViewIfNeeded();
  }
  // Hire now nearest to our title
  let hireLink = page.getByRole("link", { name: /^hire now$/i }).first();
  if ((await title.count()) > 0) {
    const nearby = page
      .locator("article, li, div")
      .filter({ hasText: "Mercedes Sprinter BLS" })
      .getByRole("link", { name: /^hire now$/i })
      .first();
    if ((await nearby.count()) > 0) hireLink = nearby;
  }
  await hireLink.waitFor({ state: "visible", timeout: 30000 });
  await hireLink.scrollIntoViewIfNeeded();
  await hireLink.evaluate((el) =>
    el.setAttribute("data-walkthrough", "hire-now"),
  );
  await addArrowOverlay(
    page,
    '[data-walkthrough="hire-now"]',
    "5. Click Hire now on a ground ambulance",
  );
  await shot(page, "06-medical-transport-listings.png");
  await clearOverlay(page);

  // Hire page for seeded Mercedes listing
  await page.goto(`${FRONTEND}/hire/${HIRE_ID}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);

  // Fix dates if needed: set end after start
  const startInput = page.locator('input[type="date"]').nth(0);
  const endInput = page.locator('input[type="date"]').nth(1);
  if ((await startInput.count()) && (await endInput.count())) {
    const start = await startInput.inputValue();
    if (start) {
      const d = new Date(start + "T12:00:00");
      d.setDate(d.getDate() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      await endInput.fill(`${yyyy}-${mm}-${dd}`);
      await page.waitForTimeout(500);
    }
  }

  const payBtn = page.getByRole("button", { name: /pay with paystack/i }).first();
  await payBtn.waitFor({ state: "visible", timeout: 30000 });
  await payBtn.scrollIntoViewIfNeeded();
  await payBtn.evaluate((el) => el.setAttribute("data-walkthrough", "pay-cta"));
  await addArrowOverlay(
    page,
    '[data-walkthrough="pay-cta"]',
    "6. Choose dates, then complete payment to hire",
  );
  await shot(page, "07-hire-ambulance.png");
  await clearOverlay(page);

  // Also capture top of hire page with ambulance image
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await shot(page, "07b-hire-ambulance-top.png");

  await browser.close();
  console.log("Updated 06/07 screenshots in", OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
