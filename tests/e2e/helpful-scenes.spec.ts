import { test, expect } from "@playwright/test";

test.describe("Phrase Rainbow state management", () => {
  test("completing a scene resets after leaving the game", async ({ page }) => {
    await page.goto("/play/phrase-rainbow");

    const slide = page.getByTestId("scene-slide");
    await expect(slide).toHaveAttribute("data-scene-state", "incomplete");

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("phrase-rainbow:complete", { detail: { sceneId: 1 } }),
      );
    });

    await expect(slide).toHaveAttribute("data-scene-state", "complete");

    await page.getByLabel("Close Phrase Rainbow game").click();
    await page.waitForURL("**/play/");

    await page.locator('a[href="/play/phrase-rainbow/"]').first().click();
    await page.waitForURL("**/play/phrase-rainbow/");

    const slideAfterReturn = page.getByTestId("scene-slide");
    await expect(slideAfterReturn).toHaveAttribute("data-scene-state", "incomplete");
  });

  test("state stays stable after visiting What's in the Box", async ({ page }) => {
    await page.goto("/play/phrase-rainbow");

    const slide = page.getByTestId("scene-slide");
    await expect(slide).toHaveAttribute("data-scene-state", "incomplete");

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("phrase-rainbow:complete", { detail: { sceneId: 1 } }),
      );
    });

    await expect(slide).toHaveAttribute("data-scene-state", "complete");

    await page.getByLabel("Close Phrase Rainbow game").click();
    await page.waitForURL("**/play/");

    await page.locator('a[href="/play/whats-in-the-box/"]').first().click();
    await page.waitForURL("**/play/whats-in-the-box/");
    await expect(page.getByLabel("Close What's in the Box game")).toBeVisible();

    await page.getByLabel("Close What's in the Box game").click();
    await page.waitForURL("**/play/");

    await page.locator('a[href="/play/phrase-rainbow/"]').first().click();
    await page.waitForURL("**/play/phrase-rainbow/");

    const slideAfterReturn = page.getByTestId("scene-slide");
    await expect(slideAfterReturn).toHaveAttribute("data-scene-state", "incomplete");
  });
});
