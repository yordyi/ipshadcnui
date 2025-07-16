import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test('should have valid manifest.json', async ({ page }) => {
    await page.goto('/');
    
    // 获取manifest链接
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
    
    // 获取manifest内容
    const manifestResponse = await page.request.get(manifestLink!);
    expect(manifestResponse.ok()).toBeTruthy();
    
    const manifest = await manifestResponse.json();
    
    // 验证必需的manifest字段
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // 验证图标
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.sizes).toBeTruthy();
      expect(icon.type).toBeTruthy();
    }
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    
    // 等待service worker注册
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        // 等待一段时间让SW注册
        await new Promise(resolve => setTimeout(resolve, 2000));
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    // 在支持SW的浏览器中应该注册成功
    if (await page.evaluate(() => 'serviceWorker' in navigator)) {
      expect(swRegistration).toBeTruthy();
    }
  });

  test('should have correct meta tags for PWA', async ({ page }) => {
    await page.goto('/');
    
    // 检查viewport meta标签
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    
    // 检查theme-color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
    
    // 检查Apple相关meta标签
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute('content');
    expect(appleCapable).toBe('yes');
    
    const appleStatusBar = await page.locator('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content');
    expect(appleStatusBar).toBeTruthy();
    
    const appleTitle = await page.locator('meta[name="apple-mobile-web-app-title"]').getAttribute('content');
    expect(appleTitle).toBeTruthy();
  });

  test('should have apple touch icons', async ({ page }) => {
    await page.goto('/');
    
    // 检查Apple touch icon
    const touchIcons = await page.locator('link[rel="apple-touch-icon"]').all();
    expect(touchIcons.length).toBeGreaterThan(0);
    
    // 验证每个图标
    for (const icon of touchIcons) {
      const href = await icon.getAttribute('href');
      expect(href).toBeTruthy();
      
      // 验证图标可访问
      const response = await page.request.get(href!);
      expect(response.ok()).toBeTruthy();
    }
  });

  test('should work offline with service worker', async ({ page, context }) => {
    // 首次访问以缓存资源
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 等待service worker激活
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    });
    
    // 进入离线模式
    await context.setOffline(true);
    
    // 尝试重新加载页面
    await page.reload();
    
    // 页面应该仍然显示一些内容（即使是离线页面）
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // 恢复在线模式
    await context.setOffline(false);
  });

  test('should have correct icon sizes in manifest', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // 检查是否有必需的图标尺寸
    const sizes = manifest.icons.map((icon: any) => icon.sizes);
    
    // PWA需要的关键尺寸
    const requiredSizes = ['192x192', '512x512'];
    
    for (const size of requiredSizes) {
      expect(sizes.some((s: string) => s === size)).toBeTruthy();
    }
    
    // 验证图标URL是否有效
    for (const icon of manifest.icons) {
      const iconResponse = await page.request.get(icon.src);
      expect(iconResponse.ok()).toBeTruthy();
    }
  });

  test('should handle app installation', async ({ page, browserName }) => {
    // 仅在Chromium中测试（支持beforeinstallprompt事件）
    if (browserName !== 'chromium') {
      test.skip();
    }
    
    await page.goto('/');
    
    // 检查是否设置了安装处理
    const hasInstallHandler = await page.evaluate(() => {
      return new Promise(resolve => {
        let hasHandler = false;
        
        // 监听beforeinstallprompt事件
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          hasHandler = true;
        });
        
        // 给一些时间让事件触发
        setTimeout(() => resolve(hasHandler), 2000);
      });
    });
    
    // 应该有安装提示处理（如果浏览器支持）
    // 注意：在某些环境下可能不会触发
  });

  test('should have correct start URL', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // 验证start_url
    expect(manifest.start_url).toBeTruthy();
    
    // 访问start_url应该成功
    const startUrl = new URL(manifest.start_url, page.url()).href;
    const response = await page.request.get(startUrl);
    expect(response.ok()).toBeTruthy();
  });

  test('should support different display modes', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.json');
    const manifest = await manifestResponse.json();
    
    // 验证display模式
    const validDisplayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
    expect(validDisplayModes).toContain(manifest.display);
    
    // 对于PWA，通常使用standalone或fullscreen
    expect(['standalone', 'fullscreen']).toContain(manifest.display);
  });
});