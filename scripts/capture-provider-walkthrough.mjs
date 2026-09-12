/**
 * Provider walkthrough: signup → create ground ambulance hire listing.
 * Run: node scripts/capture-provider-walkthrough.mjs
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
const DEMO_EMAIL = `walkthrough.provider.${Date.now()}@ambuhub.test`;
const DEMO_PASSWORD = "Walkthrough1!";
const AMBULANCE_IMAGE = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-Adriel-Desktop-projects-Ambuhub",
  "assets",
  "ambulance-01-mercedes-white.png",
);

async function ensureDemoProvider() {
  await mongoose.connect(process.env.DB_URI, {
    dbName: process.env.DB_NAME || "ambuhub",
  });
  const users = mongoose.connection.db.collection("users");
  const providers = mongoose.connection.db.collection("serviceProviders");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();

  await users.updateOne(
    { email: DEMO_EMAIL },
    {
      $set: {
        firstName: "Chidi",
        lastName: "Okeke",
        email: DEMO_EMAIL,
        phone: "08031112233",
        countryCode: "NG",
        password: hash,
        role: "service_provider",
        emailVerified: true,
        isSuspended: false,
        dateOfBirth: null,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now, favoriteServiceIds: [] },
    },
    { upsert: true },
  );

  const user = await users.findOne({ email: DEMO_EMAIL });
  await providers.updateOne(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        businessName: "Okeke Medical Transport",
        physicalAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
        website: null,
        shopSlug: `okeke-medical-${Date.now().toString(36)}`,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  await mongoose.disconnect();
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

async function clearOverlay(page) {
  await page.evaluate(() =>
    document.getElementById("__walkthrough_overlay__")?.remove(),
  );
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
        Math.max(16, box.x),
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

async function markAndShot(page, locator, label, fileName) {
  await locator.waitFor({ state: "visible", timeout: 30000 });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No box for ${fileName}`);
  await addArrowOverlayAtBox(page, box, label);
  await shot(page, fileName);
  await clearOverlay(page);
}

async function shot(page, fileName) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const publicPath = path.join(PUBLIC_DIR, fileName);
  const assetsPath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: publicPath, fullPage: false });
  try {
    fs.copyFileSync(publicPath, assetsPath);
  } catch (err) {
    console.warn("assets copy skipped", fileName, String(err));
  }
  console.log("saved", fileName);
}

async function loginViaApi(page, email, password) {
  const loginRes = await page.request.post(`${FRONTEND}/api/auth/login`, {
    data: { email, password },
  });
  if (!loginRes.ok()) {
    throw new Error(`Login failed ${loginRes.status()}: ${await loginRes.text()}`);
  }
}

async function main() {
  console.log("Seeding verified provider…");
  const creds = await ensureDemoProvider();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 01 — Sign up from auth
  await page.goto(`${FRONTEND}/auth`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const signupBtn = page.getByRole("button", { name: /^sign up$/i }).first();
  await markAndShot(
    page,
    signupBtn,
    "1. Click Sign up",
    "01-auth-signup.png",
  );
  await signupBtn.click();
  await page.waitForTimeout(1000);

  // 02 — Choose service provider
  const providerBtn = page
    .getByRole("button", { name: /i.?m a service provider/i })
    .first();
  await markAndShot(
    page,
    providerBtn,
    "2. Choose I'm a service provider",
    "02-choose-provider.png",
  );
  await providerBtn.click();
  await page.waitForTimeout(1000);

  // 03 — Create account form
  const createBtn = page
    .getByRole("button", { name: /create account/i })
    .first();
  await markAndShot(
    page,
    createBtn,
    "3. Fill the provider form, then Create account",
    "03-signup-form.png",
  );

  // 04 — Verify email screen (shown after signup)
  await page.goto(`${FRONTEND}/auth/verify-email`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);
  // If redirected away (no session), still try to capture whatever is shown
  const verifyBtn = page.getByRole("button", { name: /verify email/i }).first();
  if ((await verifyBtn.count()) > 0 && (await verifyBtn.isVisible())) {
    await markAndShot(
      page,
      verifyBtn,
      "4. Enter the email code, then Verify email",
      "04-verify-email.png",
    );
  } else {
    // Soft fallback: capture current page without marker
    await shot(page, "04-verify-email.png");
  }

  // Authenticated provider session for remaining steps
  await loginViaApi(page, creds.email, creds.password);

  // 05 — Dashboard → Add service / Upload listing
  await page.goto(`${FRONTEND}/provider/dashboard`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  let addCta = page.getByRole("link", { name: /^add service$/i }).first();
  if ((await addCta.count()) === 0 || !(await addCta.isVisible())) {
    addCta = page.getByRole("link", { name: /upload listing/i }).first();
  }
  await markAndShot(
    page,
    addCta,
    "5. Open Add service",
    "05-provider-dashboard.png",
  );
  await addCta.click();
  await page.waitForURL(/\/provider\/services\/add/, { timeout: 30000 });
  await page.waitForTimeout(1500);

  // 06 — Select Medical Transport category
  const category = page.locator("#service-category");
  await category.waitFor({ state: "visible", timeout: 30000 });
  await markAndShot(
    page,
    category,
    "6. Select Medical Transport",
    "06-select-category.png",
  );
  await category.selectOption({ value: "medical-transport" });
  await page.waitForTimeout(800);

  // 07 — Select Ground Ambulance department
  const department = page.locator("#department");
  await department.waitFor({ state: "visible", timeout: 30000 });
  await markAndShot(
    page,
    department,
    "7. Select Ground Ambulance",
    "07-select-department.png",
  );
  await department.selectOption({ value: "ground-ambulance" });
  await page.waitForTimeout(600);

  // Fill remaining required fields for a realistic publish shot
  // Country (CountrySelect custom)
  const countryTrigger = page.locator("#service-country");
  if ((await countryTrigger.count()) > 0) {
    await countryTrigger.click();
    await page.waitForTimeout(400);
    const ngOption = page
      .getByRole("option", { name: /nigeria/i })
      .first()
      .or(page.locator('[role="option"]').filter({ hasText: /nigeria/i }).first());
    if ((await ngOption.count()) > 0) {
      await ngOption.click();
    } else {
      // fallback: typeahead / list item
      const listItem = page.locator("text=Nigeria").first();
      if ((await listItem.count()) > 0) await listItem.click();
    }
    await page.waitForTimeout(500);
  }

  const state = page.locator("#service-state");
  if ((await state.count()) > 0) {
    await state.waitFor({ state: "visible", timeout: 15000 });
    // Prefer Lagos if present
    const options = await state.locator("option").allTextContents();
    const lagos = options.find((t) => /lagos/i.test(t));
    if (lagos) {
      await state.selectOption({ label: lagos.trim() });
    } else if (options.length > 1) {
      await state.selectOption({ index: 1 });
    }
  }

  await page.locator("#office-address").fill("14 Admiralty Way, Lekki Phase 1, Lagos");
  await page.locator("#price").fill("85000");
  await page.locator("#stock").fill("2");
  await page
    .locator("#service-title")
    .fill("Mercedes Sprinter BLS — Lagos (Walkthrough)");
  await page
    .locator("#service-description")
    .fill(
      "White Mercedes-Benz Sprinter basic life support ambulance available for daily hire across Lagos.",
    );

  if (fs.existsSync(AMBULANCE_IMAGE)) {
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(AMBULANCE_IMAGE);
      await page.waitForTimeout(800);
    }
  }

  // 08 — Title / details area highlight
  const titleField = page.locator("#service-title");
  await markAndShot(
    page,
    titleField,
    "8. Enter title, price, location, and photos",
    "08-fill-listing-details.png",
  );

  // 09 — Publish
  const publishBtn = page
    .getByRole("button", { name: /publish service/i })
    .first();
  await markAndShot(
    page,
    publishBtn,
    "9. Click Publish service",
    "09-publish-service.png",
  );

  await browser.close();
  console.log("\nProvider walkthrough screenshots:");
  console.log(OUT_DIR);
  console.log(PUBLIC_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
