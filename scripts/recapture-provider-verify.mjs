/**
 * Recapture provider verify-email using a seeded unverified provider session (no register API).
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
  "provider",
);
const PUBLIC_DIR = path.resolve(__dirname, "../public/walkthrough/provider");
const EMAIL = `walkthrough.provider.unverified@ambuhub.test`;
const PASSWORD = "Walkthrough1!";

async function seedUnverifiedProvider() {
  await mongoose.connect(process.env.DB_URI, {
    dbName: process.env.DB_NAME || "ambuhub",
  });
  const users = mongoose.connection.db.collection("users");
  const providers = mongoose.connection.db.collection("serviceProviders");
  const hash = await bcrypt.hash(PASSWORD, 10);
  const now = new Date();
  const phone = `0809${String(Date.now()).slice(-7)}`;

  await users.updateOne(
    { email: EMAIL },
    {
      $set: {
        firstName: "Chidi",
        lastName: "Okeke",
        email: EMAIL,
        phone,
        countryCode: "NG",
        password: hash,
        role: "service_provider",
        emailVerified: false,
        isSuspended: false,
        dateOfBirth: null,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now, favoriteServiceIds: [] },
    },
    { upsert: true },
  );
  const user = await users.findOne({ email: EMAIL });
  await providers.updateOne(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        businessName: "Okeke Medical Transport",
        physicalAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
        website: null,
        shopSlug: `okeke-unverified-${Date.now().toString(36)}`,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
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
      ring.style.cssText = `position:fixed;left:${box.x - 6}px;top:${box.y - 6}px;width:${box.width + 12}px;height:${box.height + 12}px;border:3px solid #dc2626;border-radius:14px;box-shadow:0 0 0 4px rgba(220,38,38,0.25);`;
      root.appendChild(ring);
      const calloutTop = Math.max(16, box.y - 78);
      const calloutLeft = Math.min(window.innerWidth - 320, Math.max(16, box.x));
      const callout = document.createElement("div");
      callout.style.cssText = `position:fixed;left:${calloutLeft}px;top:${calloutTop}px;max-width:300px;background:#dc2626;color:white;font:700 14px/1.35 system-ui,sans-serif;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.25);`;
      callout.textContent = label;
      root.appendChild(callout);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:fixed;inset:0;width:100%;height:100%;overflow:visible;");
      const x1 = calloutLeft + 48;
      const y1 = calloutTop + 42;
      const x2 = box.x + box.width / 2;
      const y2 = box.y + Math.min(box.height / 2, 24);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.setAttribute("stroke", "#dc2626");
      line.setAttribute("stroke-width", "4");
      svg.appendChild(line);
      const tip = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      tip.setAttribute("points", `${x2},${y2 + 10} ${x2 - 10},${y2 - 8} ${x2 + 10},${y2 - 8}`);
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
  await seedUnverifiedProvider();
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })).newPage();

  const loginRes = await page.request.post(`${FRONTEND}/api/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
  });
  if (!loginRes.ok()) {
    throw new Error(`Login failed ${loginRes.status()}: ${await loginRes.text()}`);
  }

  await page.goto(`${FRONTEND}/auth/verify-email`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const verifyBtn = page.getByRole("button", { name: /verify email/i }).first();
  await verifyBtn.waitFor({ state: "visible", timeout: 20000 });
  const box = await verifyBtn.boundingBox();
  if (!box) throw new Error("Verify button missing");
  await addArrowOverlayAtBox(
    page,
    box,
    "4. Enter the email code, then Verify email",
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const fileName = "04-verify-email.png";
  const publicPath = path.join(PUBLIC_DIR, fileName);
  await page.screenshot({ path: publicPath, fullPage: false });
  fs.copyFileSync(publicPath, path.join(OUT_DIR, fileName));
  console.log("saved", publicPath);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
