import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.ASO_ROCK_URL ?? "http://127.0.0.1:4174/";
const artifactDir = "C:\\Users\\mrzeb\\Downloads\\the-fulcrum\\output\\aso-rock-handover\\nigeria-sim\\output\\playwright\\smoke";
const downloadDir = join(artifactDir, "downloads");

mkdirSync(downloadDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1400 },
  acceptDownloads: true,
});
const page = await context.newPage();

const consoleMessages = [];
const pageErrors = [];

page.on("console", (message) => {
  consoleMessages.push({ type: message.type(), text: message.text() });
});

page.on("pageerror", (error) => {
  pageErrors.push(error.stack ?? error.message);
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function shot(name) {
  await page.screenshot({ path: join(artifactDir, name), fullPage: true });
}

async function clickButton(name) {
  await page.getByRole("button", { name }).click();
}

async function waitForText(text) {
  await page.getByText(text).waitFor({ state: "visible" });
}

async function currentDay() {
  const text = await page.locator("body").textContent();
  const match = text?.match(/Day (\d+) of your presidency/i);
  return match ? Number(match[1]) : null;
}

async function openTabAndWait(tabTestId, readyTestId) {
  await page.getByTestId(tabTestId).click();
  await page.getByTestId(readyTestId).waitFor({ state: "visible" });
}

async function resolveUntilProceedEnabled() {
  for (let guard = 0; guard < 14; guard += 1) {
    if (await page.getByTestId("proceed-btn").isEnabled()) {
      return;
    }

    const cabalChoice = page.locator('[data-testid^="cabal-choice-"]:not([disabled])').first();
    if (await cabalChoice.count()) {
      await cabalChoice.click();
      await page.waitForTimeout(300);
      continue;
    }

    await page.getByTestId("tab-decisions").click();
    await page.getByTestId("decisions-active-events").waitFor();

    const eventChoice = page.locator('[data-testid^="decision-event-"][data-testid*="-choice-"]:not([disabled])').first();
    if (await eventChoice.count()) {
      await eventChoice.click();
      await page.waitForTimeout(250);
      continue;
    }

    const chainChoice = page.locator('[data-testid^="chain-"][data-testid*="-choice-"]:not([disabled])').first();
    if (await chainChoice.count()) {
      await chainChoice.click();
      await page.waitForTimeout(250);
      continue;
    }

    throw new Error("Proceed is still disabled, but no actionable cabal or office choice was found.");
  }

  throw new Error("Office resolution guard reached before Proceed became available.");
}

let savePath = "";

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await waitForText("Aso Rock");
  await shot("01-intro.png");

  await clickButton(/Enter Game/i);
  await waitForText("Who Are You?");
  await page.locator("input").nth(0).fill("Amaka");
  await page.locator("input").nth(1).fill("Okonkwo");
  await page.locator("input").nth(2).fill("47");
  await clickButton(/^Female$/i);
  await page.locator("select").nth(0).selectOption("Lagos");
  await page.locator("select").nth(1).selectOption("Master's Degree");
  await clickButton(/^Continue$/i);

  await page.getByTestId("trait-charismatic").click();
  await page.getByTestId("trait-calculating").click();
  await page.getByTestId("ideology-reformist").click();
  await page.getByTestId("difficulty-standard").click();
  await clickButton(/^Continue$/i);

  await page.getByText("Labour Party", { exact: false }).click();
  await page.getByText("Renewed Hope (2023)", { exact: false }).click();
  await clickButton(/^Continue$/i);

  await clickButton(/Select This Candidate/i);
  await clickButton(/^Continue$/i);

  await clickButton(/Continue to Headlines/i);
  await clickButton(/Proceed to Inauguration/i);

  const promises = [
    "Reduce fuel prices within 90 days",
    "Create 2 million jobs in Year 1",
    "Stabilise the Naira exchange rate",
    "Reform the tax system",
    "Crush Boko Haram within 6 months",
    "End banditry in the North-West",
    "Overhaul the police force",
    "Free universal healthcare for under-5s",
    "30% women in cabinet positions",
    "National school feeding programme",
  ];

  for (const promise of promises) {
    await clickButton(new RegExp(escapeRegex(promise), "i"));
  }
  await clickButton(/Deliver Address/i);

  await clickButton(/Select This PA/i);
  await clickButton(/^Continue$/i);

  for (let i = 0; i < 10; i += 1) {
    if (await page.getByText("All positions filled.").count()) {
      break;
    }
    const appointButton = page.getByRole("button", { name: /^Appoint / }).last();
    await appointButton.waitFor({ state: "visible" });
    await appointButton.click();
    await page.waitForTimeout(450);
  }
  await waitForText("All positions filled.");
  await clickButton(/Continue to Intelligence Briefing/i);

  for (let i = 0; i < 6; i += 1) {
    await clickButton(/^Acknowledge$/i);
    await page.waitForTimeout(350);
  }
  await clickButton(/Proceed to Media Chat/i);

  for (let i = 0; i < 10; i += 1) {
    const response = page.locator("button.whitespace-normal").first();
    await response.waitFor({ state: "visible" });
    await response.click();
    await page.waitForTimeout(500);
  }
  await clickButton(/Begin Presidency/i);

  await page.getByTestId("proceed-btn").waitFor();
  await waitForText("Day 1 of your presidency");
  await shot("02-dashboard-day1.png");
  await page.getByTestId("cabal-meeting-card").waitFor({ state: "visible" });
  await shot("02b-cabal-day1.png");

  const downloadPromise = page.waitForEvent("download");
  await clickButton(/Export Save/i);
  const download = await downloadPromise;
  savePath = join(downloadDir, download.suggestedFilename());
  await download.saveAs(savePath);

  await openTabAndWait("tab-economy", "economy-live-files-card");
  await shot("03-economy-day1.png");
  await page.getByTestId("econ-subtab-markets").click();
  await page.getByTestId("economy-markets-chart-card").waitFor({ state: "visible" });

  await openTabAndWait("tab-security", "security-live-files-card");
  await shot("04-security-day1.png");
  await page.getByTestId("sec-subtab-theaters").click();
  await page.getByTestId("security-theaters-card").waitFor({ state: "visible" });

  await openTabAndWait("tab-politics", "politics-live-files-card");
  await shot("05-politics-day1.png");
  await page.getByTestId("pol-subtab-intrigue").click();
  await page.getByTestId("politics-hooks-card").waitFor({ state: "visible" });
  const hookProbe = page.locator('[data-testid^="politics-hook-"][data-testid$="-investigate"]').first();
  if (await hookProbe.count()) {
    await hookProbe.click();
    await page.waitForTimeout(300);
  }
  await shot("05b-politics-intrigue-day1.png");
  await page.getByTestId("pol-subtab-factions").click();
  await page.getByTestId("politics-factions-chart-card").waitFor({ state: "visible" });

  await openTabAndWait("tab-media", "headlines-card");
  await shot("06-media-day1.png");

  await resolveUntilProceedEnabled();
  await shot("07-office-resolved.png");
  await page.getByTestId("proceed-btn").click();
  await waitForText("Day 2 of your presidency");
  await shot("08-dashboard-day2.png");

  await page.locator('input[type="file"]').setInputFiles(savePath);
  await waitForText("Day 1 of your presidency");
  await shot("09-import-restored.png");

  const report = {
    baseUrl,
    savePath,
    currentDay: await currentDay(),
    consoleMessages,
    pageErrors,
  };

  writeFileSync(join(artifactDir, "smoke-report.json"), JSON.stringify(report, null, 2));

  const seriousConsole = consoleMessages.filter((entry) => entry.type === "error" && !entry.text.includes("Failed to load resource"));
  if (pageErrors.length || seriousConsole.length) {
    throw new Error(`Smoke run surfaced runtime issues. Page errors: ${pageErrors.length}, console errors: ${seriousConsole.length}`);
  }

  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
