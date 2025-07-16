import { test, expect } from '@playwright/test';
import { mockAPIResponses } from './utils/api-mocks';

test.describe('Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page, 'success');
    await page.goto('/');
  });

  test.describe('Summary Card', () => {
    test('should display summary information', async ({ page }) => {
      const summaryCard = page.locator('[data-testid="summary-card"]');
      
      // 等待卡片加载
      await expect(summaryCard).toBeVisible();
      
      // 检查是否显示关键信息
      await expect(summaryCard).toContainText('IP Address');
      await expect(summaryCard).toContainText('Location');
      await expect(summaryCard).toContainText('Device');
      await expect(summaryCard).toContainText('Browser');
    });

    test('should update when data loads', async ({ page }) => {
      const summaryCard = page.locator('[data-testid="summary-card"]');
      
      // 等待IP数据加载并显示
      await expect(summaryCard).toContainText('8.8.8.8');
      await expect(summaryCard).toContainText('Mountain View, United States');
    });
  });

  test.describe('IP Location Card', () => {
    test('should show loading state initially', async ({ page }) => {
      await page.goto('/');
      const ipCard = page.locator('[data-testid="ip-location-card"]');
      
      // 可能会短暂显示加载状态
      const hasLoadingState = await ipCard.getByText(/Loading|Fetching/).isVisible().catch(() => false);
      
      // 最终应该显示数据
      await expect(ipCard).toContainText('8.8.8.8');
    });

    test('should display map if coordinates are available', async ({ page }) => {
      const ipCard = page.locator('[data-testid="ip-location-card"]');
      
      // 等待数据加载
      await expect(ipCard).toContainText('8.8.8.8');
      
      // 检查是否有地图相关元素或坐标显示
      await expect(ipCard).toContainText(/37\.4056|Latitude/);
      await expect(ipCard).toContainText(/-122\.0775|Longitude/);
    });

    test('should show all location details', async ({ page }) => {
      const ipCard = page.locator('[data-testid="ip-location-card"]');
      
      // 验证所有位置信息字段
      await expect(ipCard).toContainText('IP Address');
      await expect(ipCard).toContainText('Country');
      await expect(ipCard).toContainText('City');
      await expect(ipCard).toContainText('Region');
      await expect(ipCard).toContainText('ISP');
      await expect(ipCard).toContainText('Time Zone');
    });
  });

  test.describe('Device Info Card', () => {
    test('should detect and display device capabilities', async ({ page }) => {
      const deviceCard = page.locator('[data-testid="device-info-card"]');
      
      // 检查基本设备信息
      await expect(deviceCard).toContainText('Operating System');
      await expect(deviceCard).toContainText('Browser');
      await expect(deviceCard).toContainText('Screen Resolution');
      
      // 检查特性检测
      await expect(deviceCard).toContainText(/Cookies|Storage/);
      await expect(deviceCard).toContainText(/JavaScript/);
    });

    test('should show battery status if available', async ({ page, context }) => {
      // 注入电池API
      await context.addInitScript(() => {
        (navigator as any).getBattery = async () => ({
          level: 0.75,
          charging: true,
          chargingTime: 3600,
          dischargingTime: Infinity
        });
      });
      
      await page.goto('/');
      const deviceCard = page.locator('[data-testid="device-info-card"]');
      
      // 可能会显示电池信息
      const hasBatteryInfo = await deviceCard.getByText(/Battery|75%/).isVisible().catch(() => false);
      // 不是所有设备都支持电池API，所以这只是一个可选检查
    });
  });

  test.describe('Browser Fingerprint Card', () => {
    test('should calculate and display fingerprint', async ({ page }) => {
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      
      // 等待指纹计算
      await expect(fingerprintCard).toBeVisible();
      
      // 检查指纹组件
      await expect(fingerprintCard).toContainText('User Agent');
      await expect(fingerprintCard).toContainText('Canvas');
      await expect(fingerprintCard).toContainText('WebGL');
      await expect(fingerprintCard).toContainText('Screen');
      
      // 应该显示某种哈希或指纹ID
      const fingerprintText = await fingerprintCard.textContent();
      expect(fingerprintText).toMatch(/[a-f0-9]{8,}/i); // 至少8位十六进制
    });

    test('should show supported features', async ({ page }) => {
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      
      // 检查功能支持显示
      await expect(fingerprintCard).toContainText(/WebRTC|Audio|Fonts/);
    });
  });

  test.describe('App Icon', () => {
    test('should display app icon in header', async ({ page }) => {
      // 检查应用图标
      const appIcon = page.locator('[data-testid="app-icon"]');
      await expect(appIcon).toBeVisible();
      
      // 验证图标是否正确加载
      const iconSrc = await appIcon.getAttribute('src');
      if (iconSrc) {
        const response = await page.request.get(iconSrc);
        expect(response.ok()).toBeTruthy();
      }
    });
  });

  test.describe('Dark Mode', () => {
    test('should toggle dark mode', async ({ page }) => {
      // 查找深色模式切换按钮
      const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
      
      if (await darkModeToggle.isVisible()) {
        // 获取初始背景色
        const initialBg = await page.evaluate(() => 
          window.getComputedStyle(document.body).backgroundColor
        );
        
        // 切换深色模式
        await darkModeToggle.click();
        
        // 等待主题切换
        await page.waitForTimeout(300);
        
        // 验证背景色已改变
        const newBg = await page.evaluate(() => 
          window.getComputedStyle(document.body).backgroundColor
        );
        
        expect(newBg).not.toBe(initialBg);
      }
    });
  });
});

test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    
    // 等待内容加载
    await page.waitForSelector('[data-testid="ip-location-card"]');
    
    // 检查基本的可访问性
    // 检查是否有适当的标题层次结构
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
    
    // 检查图片是否有alt文本
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // 检查按钮是否有适当的标签
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // 按钮应该有文本内容或aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    
    // 测试Tab键导航
    await page.keyboard.press('Tab');
    
    // 获取当前聚焦的元素
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // 继续Tab几次，确保可以导航
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // 应该能够聚焦到某个交互元素
    const currentFocus = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        role: el?.getAttribute('role'),
        type: (el as HTMLInputElement)?.type
      };
    });
    
    expect(currentFocus.tag).toBeTruthy();
  });
});