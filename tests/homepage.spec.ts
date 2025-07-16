import { test, expect } from '@playwright/test';
import { mockAPIResponses } from './utils/api-mocks';

test.describe('HomePage', () => {
  test.beforeEach(async ({ page }) => {
    // 设置成功的API响应
    await mockAPIResponses(page, 'success');
    await page.goto('/');
  });

  test('should display page title and all information cards', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/OneStep/);
    
    // 检查主标题
    await expect(page.getByRole('heading', { name: 'OneStep' })).toBeVisible();
    
    // 检查所有卡片是否存在
    await expect(page.getByText('Summary')).toBeVisible();
    await expect(page.getByText('Device Information')).toBeVisible();
    await expect(page.getByText('Browser Fingerprint')).toBeVisible();
    await expect(page.getByText('IP & Location')).toBeVisible();
  });

  test('should display device information correctly', async ({ page }) => {
    const deviceCard = page.locator('[data-testid="device-info-card"]');
    
    // 检查设备信息卡片是否包含必要的字段
    await expect(deviceCard).toContainText('Operating System');
    await expect(deviceCard).toContainText('Browser');
    await expect(deviceCard).toContainText('Screen Resolution');
    await expect(deviceCard).toContainText('Language');
    await expect(deviceCard).toContainText('Time Zone');
  });

  test('should display IP location information from API', async ({ page }) => {
    const ipCard = page.locator('[data-testid="ip-location-card"]');
    
    // 等待IP信息加载
    await expect(ipCard).toContainText('8.8.8.8');
    await expect(ipCard).toContainText('United States');
    await expect(ipCard).toContainText('Mountain View');
    await expect(ipCard).toContainText('California');
    await expect(ipCard).toContainText('Google LLC');
  });

  test('should handle loading states', async ({ page }) => {
    // 重新加载页面并检查加载状态
    await page.reload();
    
    // 检查是否显示加载状态
    const ipCard = page.locator('[data-testid="ip-location-card"]');
    await expect(ipCard).toContainText('Loading');
  });

  test('should display browser fingerprint', async ({ page }) => {
    const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
    
    // 检查浏览器指纹卡片包含必要信息
    await expect(fingerprintCard).toContainText('User Agent');
    await expect(fingerprintCard).toContainText('Canvas Fingerprint');
    await expect(fingerprintCard).toContainText('WebGL');
    await expect(fingerprintCard).toContainText('Fonts');
  });

  test('should handle PWA features', async ({ page }) => {
    // 检查manifest链接
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    
    // 检查PWA元标签
    await expect(page.locator('meta[name="theme-color"]')).toBeVisible();
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  });
});

test.describe('HomePage Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    await mockAPIResponses(page, 'error');
    await page.goto('/');
    
    const ipCard = page.locator('[data-testid="ip-location-card"]');
    
    // 检查错误处理
    await expect(ipCard).toContainText('Failed to load');
  });

  test('should handle partial data', async ({ page }) => {
    await mockAPIResponses(page, 'partial');
    await page.goto('/');
    
    const ipCard = page.locator('[data-testid="ip-location-card"]');
    
    // 等待数据加载
    await expect(ipCard).toContainText('192.0.2.1');
    await expect(ipCard).toContainText('Unknown');
  });

  test('should handle data inconsistency', async ({ page }) => {
    await mockAPIResponses(page, 'mismatch');
    await page.goto('/');
    
    const ipCard = page.locator('[data-testid="ip-location-card"]');
    
    // 应该显示不匹配的数据
    await expect(ipCard).toContainText('210.157.1.13');
    await expect(ipCard).toContainText('Japan');
    await expect(ipCard).toContainText('Tokyo');
  });
});

test.describe('Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    
    // 检查移动端布局
    await expect(page.getByRole('heading', { name: 'OneStep' })).toBeVisible();
    
    // 检查卡片是否垂直排列（在移动端）
    const cards = page.locator('.grid > div');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    
    // 所有卡片应该仍然可见
    await expect(page.getByText('Summary')).toBeVisible();
    await expect(page.getByText('Device Information')).toBeVisible();
  });
});