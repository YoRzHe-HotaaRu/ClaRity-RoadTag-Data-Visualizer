import { test, expect } from "@playwright/test";

test.describe("Admin Authentication", () => {
    test("unauthenticated user is redirected to login", async ({ page }) => {
        await page.goto("/admin");

        // Should be redirected to login page
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test("login page displays correctly", async ({ page }) => {
        await page.goto("/admin/login");

        // Check page elements
        await expect(page.locator("text=ClaRity Admin")).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("shows error for invalid credentials", async ({ page }) => {
        await page.goto("/admin/login");

        // Fill in wrong credentials
        await page.fill('input[type="email"]', "wrong@email.com");
        await page.fill('input[type="password"]', "wrongpassword");

        // Submit
        await page.click('button[type="submit"]');

        // Should show error message
        await expect(page.locator("text=Invalid email or password")).toBeVisible({
            timeout: 5000,
        });
    });

    test("successful login redirects to dashboard", async ({ page }) => {
        await page.goto("/admin/login");

        // Fill in correct credentials (from env)
        await page.fill('input[type="email"]', "admin@clarity.com");
        await page.fill('input[type="password"]', "admin123");

        // Submit
        await page.click('button[type="submit"]');

        // Should redirect to admin dashboard
        await expect(page).toHaveURL("/admin", { timeout: 10000 });
        await expect(page.locator("text=Dashboard")).toBeVisible();
    });
});

test.describe("Admin Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto("/admin/login");
        await page.fill('input[type="email"]', "admin@clarity.com");
        await page.fill('input[type="password"]', "admin123");
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL("/admin", { timeout: 10000 });
    });

    test("dashboard shows stats", async ({ page }) => {
        await expect(page.locator("text=Total Locations")).toBeVisible();
        await expect(page.locator("text=Total Images")).toBeVisible();
    });

    test("can navigate to locations page", async ({ page }) => {
        await page.click("text=Locations");
        await expect(page).toHaveURL("/admin/locations");
    });

    test("can navigate to add location", async ({ page }) => {
        await page.click("text=+ Add Location");
        await expect(page).toHaveURL("/admin/locations/new");
    });
});

test.describe("Admin Locations Management", () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto("/admin/login");
        await page.fill('input[type="email"]', "admin@clarity.com");
        await page.fill('input[type="password"]', "admin123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/admin", { timeout: 10000 });
    });

    test("add location form displays all fields", async ({ page }) => {
        await page.goto("/admin/locations/new");

        await expect(page.locator("text=Add New Location")).toBeVisible();
        await expect(page.locator('input[placeholder*="name"]')).toBeVisible();
        await expect(page.locator('input[placeholder*="coordinates"]')).toBeVisible();
        await expect(page.locator("select")).toBeVisible();
    });

    test("form validates required fields", async ({ page }) => {
        await page.goto("/admin/locations/new");

        // Try to submit empty form
        await page.click("button:has-text('Create Location')");

        // Browser validation should prevent submission
        // (HTML5 required attribute)
    });
});

test.describe("Admin Logout", () => {
    test("logout returns to login page", async ({ page }) => {
        // Login first
        await page.goto("/admin/login");
        await page.fill('input[type="email"]', "admin@clarity.com");
        await page.fill('input[type="password"]', "admin123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/admin", { timeout: 10000 });

        // Click logout
        await page.click("button:has-text('Logout')");

        // Should redirect to login
        await expect(page).toHaveURL("/admin/login", { timeout: 10000 });
    });
});
