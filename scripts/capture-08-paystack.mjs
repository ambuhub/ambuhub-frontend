/**
 * Capture final walkthrough step: Pay with Paystack.
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
const PUBLIC_DIR = path.resolve(__dirname, "../public/walkthrough");
const HIRE_ID = "6aa52d5397b1fe31b35d88ef";
const DEMO_EMAIL = `walkthrough.pay.${Date.now()}@ambuhub.test`;
const DEMO_PASSWORD = "Walkthrough1!";
const FILE_NAME = "08-pay-with-paystack.png";

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

async function addArrowOverlayAtBox(page, box, label) {
  await page.evaluate(
    ({ box, label }) => {
      document.getElementById("__walkthrough_overlay__")?.remove();
      const root = document.createElement("div");
      root.id = "__walkthrough_overlay__";
      root.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";

      const ring = document.createElement("div");
      ring.style.cssText = `
        position:fixed;
        left:${box.x - 6}px;
        top:${box.y - 6}px;
        width:${box.width + 12}px;
        height:${box.height + 12}px;
        border:3px solid #dc2626;
        border-radius:14px;
        box-shadow:0 0 0 4px rgba(220,38,38,0.25);
      `;
      root.appendChild(ring);

      const calloutTop = Math.max(16, box.y - 78);
      const calloutLeft = Math.min(
        window.innerWidth - 320,
        Math.max(16, box.x + box.width / 2 - 140),
      );
      const callout = document.createElement("div");
      callout.style.cssText = `
        position:fixed;
        left:${calloutLeft}px;
        top:${calloutTop}px;
        max-width:300px;
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
      const x1 = calloutLeft + callout.offsetWidth / 2;
      const y1 = calloutTop + 42;
      const x2 = box.x + box.width / 2;
      const y2 = box.y + box.height / 2;
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
        `${x2},${y2 + 10} ${x2 - 10},${y2 - 8} ${x2 + 10},${y2 - 8}`,
      );
      tip.setAttribute("fill", "#dc2626");
      svg.appendChild(tip);
      root.appendChild(svg);
      document.body.appendChild(root);
    },
    { box, label },
  );
  await page.waitForTimeout(200);
}

async function main() {
  await ensureDemoClient();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(`${FRONTEND}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  // Prefer API login so we don't race React hydration on the form
  const loginRes = await page.request.post(`${FRONTEND}/api/auth/login`, {
    data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  if (!loginRes.ok()) {
    const body = await loginRes.text();
    throw new Error(`Login failed ${loginRes.status()}: ${body}`);
  }

  await page.goto(`${FRONTEND}/hire/${HIRE_ID}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);

  const startInput = page.locator('label:has-text("Start date") input[type="date"]');
  const endInput = page.locator('label:has-text("Return by") input[type="date"]');
  await startInput.waitFor({ state: "visible", timeout: 30000 });
  const startVal = await startInput.inputValue();
  if (startVal) {
    const d = new Date(`${startVal}T12:00:00`);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    await endInput.fill(`${yyyy}-${mm}-${dd}`);
    await page.waitForTimeout(500);
  }

  const payBtn = page.getByRole("button", { name: /pay with paystack/i }).first();
  await payBtn.waitFor({ state: "visible", timeout: 30000 });
  await payBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const box = await payBtn.boundingBox();
  if (!box) throw new Error("Pay with Paystack button has no bounding box");
  console.log("pay button box", box);

  await addArrowOverlayAtBox(page, box, "7. Click Pay with Paystack");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const publicPath = path.join(PUBLIC_DIR, FILE_NAME);
  const assetsPath = path.join(OUT_DIR, FILE_NAME);
  await page.screenshot({ path: publicPath, fullPage: false });
  try {
    fs.copyFileSync(publicPath, assetsPath);
  } catch (err) {
    console.warn("assets copy skipped", String(err));
  }
  console.log("saved", publicPath);
  console.log("saved", assetsPath);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
