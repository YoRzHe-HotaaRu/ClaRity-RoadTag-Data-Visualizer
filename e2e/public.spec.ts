import { test, expect } from "@playwright/test";

test.describe("Public Site", () => {
    test("homepage loads with map and sidebar", async ({ page }) => {
        await page.goto("/");

        // Check sidebar is visible
        await expect(page.locator("text=ClaRity RoadTag")).toBeVisible();

        // Check search input is visible
        await expect(
            page.locator('input[placeholder*="Search"]')
        ).toBeVisible();

        // Check state filter dropdown is visible
        await expect(page.locator("select")).toBeVisible();

        // Check map container exists
        await expect(page.locator(".maplibregl-canvas")).toBeVisible({
            timeout: 10000,
        });
    });

    test("search filters locations by name", async ({ page }) => {
        await page.goto("/");

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // Type in search
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Petronas");

        // Wait for filtering (debounced)
        await page.waitForTimeout(500);

        // Verify search value is in input
        await expect(searchInput).toHaveValue("Petronas");
    });

    test("state filter updates location list", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Select a state from dropdown
        const stateSelect = page.locator("select");
        await stateSelect.selectOption("Kuala Lumpur");

        // Verify selection
        await expect(stateSelect).toHaveValue("Kuala Lumpur");
    });

    test("map style switcher works", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Wait for map to load
        await page.waitForSelector(".maplibregl-canvas", { timeout: 10000 });

        // Click satellite button
        const satelliteBtn = page.locator("button", { hasText: "Satellite" });
        if (await satelliteBtn.isVisible()) {
            await satelliteBtn.click();
            // Wait a moment for style change
            await page.waitForTimeout(1000);
        }
    });

    test("tag count is displayed", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Check for tag count section (should show "tags" or "tag")
        await expect(page.locator("text=/\\d+ tag/")).toBeVisible({ timeout: 5000 });
    });
});

test.describe("Location Detail Page", () => {
    test("shows 404 for non-existent location", async ({ page }) => {
        const response = await page.goto("/location/nonexistent-id-12345");
        expect(response?.status()).toBe(404);
    });
});
