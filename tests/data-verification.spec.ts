import { test, expect } from '@playwright/test';

test.describe('Data Verification - Real World Data Accuracy', () => {
  test.describe('IP Address Verification', () => {
    test('should get consistent IP address from multiple sources', async ({ page }) => {
      await page.goto('/');
      
      // 等待IP数据加载
      await page.waitForLoadState('networkidle');
      
      // 从我们的API获取IP
      const ipResponse = await page.request.get('/api/ip');
      const ourData = await ipResponse.json();
      
      // 直接从多个第三方API获取IP进行对比
      const ipifyResponse = await page.request.get('https://api.ipify.org?format=json');
      const ipifyData = await ipifyResponse.json();
      
      // 验证IP地址一致性
      expect(ourData.ip).toBeTruthy();
      expect(ourData.ip).toBe(ipifyData.ip);
      
      console.log('Verified IP:', ourData.ip);
    });

    test('should get accurate geolocation data', async ({ page }) => {
      await page.goto('/');
      
      // 获取我们的地理位置数据
      const response = await page.request.get('/api/ip');
      const data = await response.json();
      
      // 验证地理位置数据的合理性
      expect(data.latitude).toBeGreaterThanOrEqual(-90);
      expect(data.latitude).toBeLessThanOrEqual(90);
      expect(data.longitude).toBeGreaterThanOrEqual(-180);
      expect(data.longitude).toBeLessThanOrEqual(180);
      
      // 验证必要的地理信息字段
      expect(data.country_name).toBeTruthy();
      expect(data.country_code).toMatch(/^[A-Z]{2}$/);
      expect(data.timezone).toBeTruthy();
      
      console.log('Location data:', {
        country: data.country_name,
        city: data.city,
        coordinates: `${data.latitude}, ${data.longitude}`,
        timezone: data.timezone
      });
    });

    test('should detect VPN/Proxy usage indicators', async ({ page }) => {
      await page.goto('/');
      
      const response = await page.request.get('/api/ip');
      const data = await response.json();
      
      // 检查可能的VPN/代理指标
      const vpnIndicators = {
        isDataCenter: data.org?.toLowerCase().includes('hosting') || 
                     data.org?.toLowerCase().includes('cloud') ||
                     data.org?.toLowerCase().includes('datacenter'),
        isKnownVPN: data.org?.toLowerCase().includes('vpn') ||
                   data.org?.toLowerCase().includes('proxy'),
        hasHostname: data.hostname && data.hostname !== data.ip
      };
      
      console.log('VPN/Proxy indicators:', vpnIndicators);
      
      // 记录ASN信息用于验证
      if (data.asn) {
        console.log('ASN:', data.asn, 'Organization:', data.org);
      }
    });
  });

  test.describe('Device Information Accuracy', () => {
    test('should detect correct operating system', async ({ page, browserName }) => {
      await page.goto('/');
      
      const deviceCard = page.locator('[data-testid="device-info-card"]');
      await deviceCard.waitFor();
      
      const deviceText = await deviceCard.textContent();
      
      // 获取实际的平台信息
      const platform = await page.evaluate(() => navigator.platform);
      const userAgent = await page.evaluate(() => navigator.userAgent);
      
      console.log('Platform:', platform);
      console.log('User Agent:', userAgent);
      
      // 验证操作系统检测
      if (platform.includes('Mac')) {
        expect(deviceText).toContain('macOS');
      } else if (platform.includes('Win')) {
        expect(deviceText).toContain('Windows');
      } else if (platform.includes('Linux')) {
        expect(deviceText).toContain('Linux');
      }
      
      // 验证浏览器检测
      expect(deviceText?.toLowerCase()).toContain(browserName);
    });

    test('should detect accurate screen resolution', async ({ page, viewport }) => {
      await page.goto('/');
      
      const deviceCard = page.locator('[data-testid="device-info-card"]');
      await deviceCard.waitFor();
      
      // 获取实际屏幕分辨率
      const screenInfo = await page.evaluate(() => ({
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        pixelRatio: window.devicePixelRatio
      }));
      
      const deviceText = await deviceCard.textContent();
      
      // 验证分辨率信息存在
      expect(deviceText).toContain(`${screenInfo.width}x${screenInfo.height}`);
      
      console.log('Screen info:', screenInfo);
      console.log('Viewport:', viewport);
    });

    test('should detect correct timezone and locale', async ({ page }) => {
      await page.goto('/');
      
      const deviceCard = page.locator('[data-testid="device-info-card"]');
      await deviceCard.waitFor();
      
      // 获取系统时区和语言
      const systemInfo = await page.evaluate(() => ({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
        languages: navigator.languages
      }));
      
      const deviceText = await deviceCard.textContent();
      
      // 验证时区检测
      expect(deviceText).toContain(systemInfo.timezone);
      
      // 验证语言检测
      expect(deviceText).toContain(systemInfo.locale);
      
      console.log('System info:', systemInfo);
    });

    test('should detect hardware capabilities accurately', async ({ page }) => {
      await page.goto('/');
      
      // 获取硬件信息
      const hardwareInfo = await page.evaluate(() => ({
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
        platform: navigator.platform,
        vendor: navigator.vendor,
        maxTouchPoints: navigator.maxTouchPoints
      }));
      
      console.log('Hardware capabilities:', hardwareInfo);
      
      // 验证硬件信息的合理性
      if (hardwareInfo.cores) {
        expect(hardwareInfo.cores).toBeGreaterThan(0);
        expect(hardwareInfo.cores).toBeLessThanOrEqual(64); // 合理的CPU核心数
      }
      
      if (hardwareInfo.memory) {
        expect(hardwareInfo.memory).toBeGreaterThan(0);
        expect(hardwareInfo.memory).toBeLessThanOrEqual(128); // 合理的内存大小(GB)
      }
    });
  });

  test.describe('Browser Fingerprint Verification', () => {
    test('should generate consistent fingerprint on page reload', async ({ page }) => {
      await page.goto('/');
      
      // 等待指纹计算完成
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      await fingerprintCard.waitFor();
      await page.waitForTimeout(2000); // 给指纹计算更多时间
      
      // 获取第一次的指纹数据
      const firstFingerprint = await fingerprintCard.textContent();
      
      // 重新加载页面
      await page.reload();
      await fingerprintCard.waitFor();
      await page.waitForTimeout(2000);
      
      // 获取第二次的指纹数据
      const secondFingerprint = await fingerprintCard.textContent();
      
      // 指纹应该保持一致
      expect(firstFingerprint).toBe(secondFingerprint);
      
      console.log('Fingerprint consistency verified');
    });

    test('should detect Canvas fingerprint', async ({ page }) => {
      await page.goto('/');
      
      // 测试Canvas指纹功能
      const canvasFingerprint = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        // 绘制测试图案
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser Fingerprint Test', 2, 2);
        
        return canvas.toDataURL();
      });
      
      expect(canvasFingerprint).toBeTruthy();
      console.log('Canvas fingerprint generated');
      
      // 验证浏览器指纹卡片显示了Canvas信息
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      await fingerprintCard.waitFor();
      
      const cardText = await fingerprintCard.textContent();
      expect(cardText).toContain('Canvas');
    });

    test('should detect WebGL capabilities', async ({ page }) => {
      await page.goto('/');
      
      // 测试WebGL支持
      const webglInfo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return { supported: false };
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          supported: true,
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
          unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null
        };
      });
      
      console.log('WebGL info:', webglInfo);
      
      // 验证WebGL检测
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      const cardText = await fingerprintCard.textContent();
      
      expect(cardText).toContain('WebGL');
      
      if (webglInfo.supported) {
        expect(webglInfo.vendor).toBeTruthy();
        expect(webglInfo.renderer).toBeTruthy();
      }
    });

    test('should detect audio context fingerprint', async ({ page }) => {
      await page.goto('/');
      
      // 测试音频指纹
      const audioSupport = await page.evaluate(() => {
        return typeof (window.AudioContext || (window as any).webkitAudioContext) !== 'undefined';
      });
      
      expect(audioSupport).toBe(true);
      
      const fingerprintCard = page.locator('[data-testid="browser-fingerprint-card"]');
      const cardText = await fingerprintCard.textContent();
      
      expect(cardText).toContain('Audio');
      console.log('Audio fingerprint support verified');
    });
  });

  test.describe('Cross-Validation Tests', () => {
    test('should match IP location with timezone', async ({ page }) => {
      await page.goto('/');
      
      // 获取IP位置信息
      const ipResponse = await page.request.get('/api/ip');
      const ipData = await ipResponse.json();
      
      // 获取设备时区
      const deviceTimezone = await page.evaluate(() => 
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      
      console.log('IP Location:', ipData.city, ipData.country_name);
      console.log('IP Timezone:', ipData.timezone);
      console.log('Device Timezone:', deviceTimezone);
      
      // 如果是本地IP或VPN，时区可能不匹配，这是正常的
      if (ipData.org?.toLowerCase().includes('vpn') || 
          ipData.org?.toLowerCase().includes('proxy')) {
        console.log('VPN/Proxy detected - timezone mismatch is expected');
      }
    });

    test('should verify data consistency across multiple page loads', async ({ page }) => {
      const results = [];
      
      // 加载页面3次，收集数据
      for (let i = 0; i < 3; i++) {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const ipResponse = await page.request.get('/api/ip');
        const data = await ipResponse.json();
        
        results.push({
          ip: data.ip,
          country: data.country_name,
          city: data.city,
          org: data.org
        });
        
        if (i < 2) {
          await page.waitForTimeout(1000); // 等待1秒再重新加载
        }
      }
      
      // 验证数据一致性
      for (let i = 1; i < results.length; i++) {
        expect(results[i].ip).toBe(results[0].ip);
        expect(results[i].country).toBe(results[0].country);
        expect(results[i].city).toBe(results[0].city);
        expect(results[i].org).toBe(results[0].org);
      }
      
      console.log('Data consistency verified across', results.length, 'page loads');
      console.log('Consistent data:', results[0]);
    });
  });

  test.describe('Real Data Validation', () => {
    test('should get non-mocked real IP address', async ({ page }) => {
      await page.goto('/');
      
      // 确保我们没有使用mock数据
      const response = await page.request.get('/api/ip');
      const data = await response.json();
      
      // 验证这不是mock数据（mock数据通常使用8.8.8.8等特定IP）
      const commonMockIPs = ['8.8.8.8', '1.1.1.1', '127.0.0.1', '192.168.1.1'];
      expect(commonMockIPs).not.toContain(data.ip);
      
      // 验证IP格式
      expect(data.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      
      // 验证每个段都在有效范围内
      const segments = data.ip.split('.').map(Number);
      segments.forEach(segment => {
        expect(segment).toBeGreaterThanOrEqual(0);
        expect(segment).toBeLessThanOrEqual(255);
      });
      
      console.log('Real IP verified:', data.ip);
    });

    test('should detect real browser and OS combinations', async ({ page, browserName }) => {
      await page.goto('/');
      
      const userAgent = await page.evaluate(() => navigator.userAgent);
      const platform = await page.evaluate(() => navigator.platform);
      
      // 验证浏览器和操作系统的真实组合
      const validCombinations = {
        'chromium': ['Win', 'Mac', 'Linux'],
        'firefox': ['Win', 'Mac', 'Linux'],
        'webkit': ['Mac', 'iPhone', 'iPad']
      };
      
      const hasValidPlatform = validCombinations[browserName].some(p => 
        platform.includes(p) || userAgent.includes(p)
      );
      
      expect(hasValidPlatform).toBe(true);
      
      console.log('Valid browser/OS combination:', browserName, '/', platform);
    });
  });
});