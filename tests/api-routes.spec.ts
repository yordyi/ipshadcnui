import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  test.describe('/api/ip', () => {
    test('should return IP information', async ({ request }) => {
      const response = await request.get('/api/ip');
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // 验证响应结构
      expect(data).toHaveProperty('ip');
      expect(data).toHaveProperty('country_name');
      expect(data).toHaveProperty('city');
      expect(data).toHaveProperty('latitude');
      expect(data).toHaveProperty('longitude');
      
      // 验证数据类型
      expect(typeof data.ip).toBe('string');
      expect(typeof data.latitude).toBe('number');
      expect(typeof data.longitude).toBe('number');
    });

    test('should handle rate limiting', async ({ request }) => {
      // 发送多个请求来测试速率限制
      const requests = Array(10).fill(null).map(() => request.get('/api/ip'));
      const responses = await Promise.all(requests);
      
      // 至少应该有一些成功的响应
      const successfulResponses = responses.filter(r => r.ok());
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('/api/icon', () => {
    test('should return SVG icon for different sizes', async ({ request }) => {
      const sizes = ['16', '32', '64', '128', '256'];
      
      for (const size of sizes) {
        const response = await request.get(`/api/icon/${size}`);
        
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image/svg+xml');
        
        const svgContent = await response.text();
        expect(svgContent).toContain('<svg');
        expect(svgContent).toContain(`width="${size}"`);
        expect(svgContent).toContain(`height="${size}"`);
      }
    });

    test('should handle invalid size parameter', async ({ request }) => {
      const response = await request.get('/api/icon/invalid');
      
      // 应该返回默认大小或错误
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(500);
    });

    test('should handle very large size parameter', async ({ request }) => {
      const response = await request.get('/api/icon/10000');
      
      // 应该限制最大尺寸或返回错误
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(500);
    });
  });
});

test.describe('API Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // 阻止所有外部API请求
    await context.route('https://ipapi.co/**', route => route.abort());
    await context.route('https://api.ipify.org/**', route => route.abort());
    await context.route('https://ipwho.is/**', route => route.abort());
    await context.route('https://api.bigdatacloud.net/**', route => route.abort());
    
    const response = await page.request.get('/api/ip');
    
    // 即使外部API失败，内部API应该返回一些响应
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle malformed requests', async ({ request }) => {
    // 发送带有恶意参数的请求
    const response = await request.get('/api/ip?callback=<script>alert(1)</script>');
    
    // 应该安全处理
    expect(response.status()).toBeLessThan(500);
    
    const text = await response.text();
    // 不应该直接返回脚本标签
    expect(text).not.toContain('<script>');
  });
});

test.describe('API Performance', () => {
  test('should respond within reasonable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/api/ip');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    // API应该在5秒内响应
    expect(responseTime).toBeLessThan(5000);
    expect(response.ok()).toBeTruthy();
  });

  test('should handle concurrent requests', async ({ request }) => {
    // 发送并发请求
    const concurrentRequests = 5;
    const requests = Array(concurrentRequests).fill(null).map(() => 
      request.get('/api/ip')
    );
    
    const responses = await Promise.all(requests);
    
    // 所有请求都应该成功
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });
});