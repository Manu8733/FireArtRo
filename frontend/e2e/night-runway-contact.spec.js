const { test, expect } = require("@playwright/test");

const EVENT_DATE = "2030-06-21";

async function completeRequiredFields(page) {
  await page.getByLabel("Tip eveniment").selectOption({ label: "Nuntă" });
  await page.getByLabel("Data evenimentului").fill(EVENT_DATE);
  await page.getByLabel("Localitatea").fill("Cluj-Napoca");
  await page.getByLabel("Spectacol dorit").selectOption({ label: "Show drone" });
  await page.getByLabel("Nume").fill("Popescu");
  await page.getByLabel("Prenume").fill("Ana");
  await page.getByLabel("Telefon").fill("0722000000");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel(/Sunt de acord cu prelucrarea datelor/i).check();
}

test("contactul este un singur formular compact, fără hero, progres sau recapitulare", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1, name: "Spune-ne despre eveniment." })).toBeVisible();
  await expect(page.getByText("Data, locul și tipul de spectacol sunt suficiente pentru început.")).toBeVisible();
  await expect(page.getByTestId("quote-form")).toBeVisible();
  await expect(page.getByLabel("Tip eveniment")).toBeVisible();
  await expect(page.getByRole("button", { name: "Trimite cererea" })).toBeVisible();

  await expect(page.locator(".nr-contact-hero")).toHaveCount(0);
  await expect(page.locator(".nr-contact-progress")).toHaveCount(0);
  await expect(page.locator(".nr-contact-console")).toHaveCount(0);
  await expect(page.getByTestId("brief-stage-review")).toHaveCount(0);
});

test("detaliile opționale rămân pliate până când utilizatorul le cere", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  const optionalDetails = page.getByTestId("quote-optional-details");
  await expect(optionalDetails).not.toHaveAttribute("open", "");
  await expect(page.getByLabel("Locația exactă")).not.toBeVisible();

  await page.getByText("Adaugă detalii", { exact: true }).click();
  await expect(page.getByLabel("Locația exactă")).toBeVisible();
  await expect(page.getByLabel("Pachet selectat")).toBeVisible();
  await expect(page.getByLabel("Mesaj")).toBeVisible();
});

test("validarea este inline și mută focusul la primul câmp incomplet", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Trimite cererea" }).click();

  await expect(page.getByRole("alert")).toContainText("Completează câmpurile obligatorii");
  await expect(page.getByLabel("Tip eveniment")).toBeFocused();
  await expect(page.getByText("Alege tipul evenimentului.")).toBeVisible();
});

test("serviciul din query este preselectat și păstrat ca array în payload", async ({ page }) => {
  await page.goto("/contact?service=Show%20drone", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Spectacol dorit")).toHaveValue("Show drone");
});

test("trimite contractul backend integral și afișează confirmarea compactă", async ({ page }) => {
  let submittedPayload;
  await page.route("**/api/quotes", async (route) => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "quote-1" }) });
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await completeRequiredFields(page);
  await page.getByRole("button", { name: "Trimite cererea" }).click();

  await expect(page.getByTestId("quote-success")).toContainText("Cererea a fost trimisă.");
  expect(submittedPayload).toEqual({
    first_name: "Popescu",
    last_name: "Ana",
    phone: "0722000000",
    email: "ana@example.com",
    locality: "Cluj-Napoca",
    event_location: "",
    event_date: EVENT_DATE,
    event_type: "Nuntă",
    services: ["Show drone"],
    package_id: "",
    package_title: "",
    message: "",
    consent: true,
    company_website: "",
  });
});

test("detaliile opționale și pachetul preselectat ajung în payload", async ({ page }) => {
  let submittedPayload;
  await page.route("**/api/quotes", async (route) => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "quote-2" }) });
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await completeRequiredFields(page);
  await page.getByText("Adaugă detalii", { exact: true }).click();
  await page.getByLabel("Locația exactă").fill("Piața Unirii");
  await page.getByLabel("Pachet selectat").selectOption("hybrid-signature");
  await page.getByLabel("Mesaj").fill("Acces tehnic dinspre strada principală.");
  await page.getByRole("button", { name: "Trimite cererea" }).click();

  expect(submittedPayload).toMatchObject({
    event_location: "Piața Unirii",
    package_id: "hybrid-signature",
    package_title: "Hybrid Signature",
    message: "Acces tehnic dinspre strada principală.",
  });
});

test("eroarea API păstrează datele și mesajul 429 rămâne explicit", async ({ page }) => {
  await page.route("**/api/quotes", (route) => route.fulfill({ status: 429, body: "{}" }));
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await completeRequiredFields(page);
  await page.getByRole("button", { name: "Trimite cererea" }).click();

  await expect(page.getByTestId("quote-error")).toContainText("Ai trimis mai multe solicitări");
  await expect(page.getByLabel("Email")).toHaveValue("ana@example.com");
  await expect(page.getByLabel("Spectacol dorit")).toHaveValue("Show drone");
});

test("pe mobil primul câmp și contactul direct sunt în primul viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  const metrics = await page.evaluate(() => {
    const firstField = document.querySelector("#quote-event-type").getBoundingClientRect();
    const h1 = getComputedStyle(document.querySelector("h1"));
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      pageHeight: document.documentElement.scrollHeight,
      firstFieldTop: firstField.top,
      firstFieldHeight: firstField.height,
      h1Size: Number.parseFloat(h1.fontSize),
    };
  });

  expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.firstFieldTop).toBeLessThan(844);
  expect(metrics.firstFieldHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.h1Size).toBeLessThanOrEqual(46);
  expect(metrics.pageHeight).toBeLessThan(2200);
  await expect(page.locator("a[href^='mailto:']").first()).toBeVisible();
});
