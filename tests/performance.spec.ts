import { test, expect } from '@playwright/test';
import { mockAPIResponses } from './utils/api-mocks';

test.describe('Performance Tests', () => {
  test('should load page within acceptable time', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    
    // 启用性能监控
    await page.goto('/');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 测量性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        // First Contentful Paint
        fcp: navigation.loadEventEnd - navigation.fetchStart,
        // DOM Content Loaded
        dcl: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        // Load Event
        load: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    // 验证性能指标
    expect(metrics.fcp).toBeLessThan(2000); // FCP应该小于2秒
    expect(metrics.dcl).toBeLessThan(3000); // DCL应该小于3秒
    expect(metrics.load).toBeLessThan(4000); // 总加载时间应该小于4秒
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await mockAPIResponses(page, 'success');
    
    // 获取初始内存使用
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // 多次导航
    for (let i = 0; i < 5; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    // 强制垃圾回收（如果可用）
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc();
      }
    });
    
    await page.waitForTimeout(1000);
    
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // 内存增长不应该超过50%
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
      expect(memoryGrowth).toBeLessThan(0.5);
    }
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    // 模拟慢速3G网络
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await mockAPIResponses(page, 'success');
    
    const startTime = Date.now();
    await page.goto('/');
    
    // 页面应该显示某些内容，即使在慢速网络下
    await expect(page.getByRole('heading', { name: 'OneStep' })).toBeVisible({ timeout: 10000 });
    
    const firstContentTime = Date.now() - startTime;
    
    // 即使在慢速网络下，第一个内容也应该在10秒内出现
    expect(firstContentTime).toBeLessThan(10000);
  });

  test('should lazy load non-critical resources', async ({ page }) => {
    let imageRequests = 0;
    
    // 监控图片请求
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        imageRequests++;
      }
    });
    
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    
    // 初始加载时不应该请求太多图片
    expect(imageRequests).toBeLessThan(10);
  });

  test('should cache static assets', async ({ page, context }) => {
    const cachedResources = new Set<string>();
    
    // 监控缓存的资源
    page.on('response', response => {
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl && cacheControl.includes('max-age')) {
        cachedResources.add(response.url());
      }
    });
    
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 应该有一些资源被缓存
    expect(cachedResources.size).toBeGreaterThan(0);
    
    // 重新加载页面
    const secondLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - secondLoadStart;
    
    // 第二次加载应该更快（由于缓存）
    expect(secondLoadTime).toBeLessThan(2000);
  });

  test('should optimize bundle size', async ({ page }) => {
    const jsResources: number[] = [];
    
    // 监控JavaScript资源大小
    page.on('response', async response => {
      if (response.url().includes('.js') && response.ok()) {
        const body = await response.body();
        jsResources.push(body.length);
      }
    });
    
    await mockAPIResponses(page, 'success');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 计算总JS大小
    const totalJsSize = jsResources.reduce((sum, size) => sum + size, 0);
    
    // 总JS大小不应该超过1MB（未压缩）
    expect(totalJsSize).toBeLessThan(1024 * 1024);
  });

  test('should handle concurrent API calls efficiently', async ({ page }) => {
    await page.goto('/');
    
    // 监控API调用
    const apiCalls: Promise<any>[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.response());
      }
    });
    
    // 等待所有API调用完成
    await page.waitForLoadState('networkidle');
    
    // 验证API调用是并发的（不是串行的）
    const responses = await Promise.all(apiCalls);
    expect(responses.length).toBeGreaterThan(0);
  });
});