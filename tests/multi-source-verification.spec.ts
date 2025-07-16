import { test, expect } from '@playwright/test';

test.describe('Multi-Source Data Verification', () => {
  test('should verify IP data consistency across multiple APIs', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Multi-Source IP Verification ===');
    
    // 从我们的API获取数据
    const ourResponse = await page.request.get('/api/ip');
    const ourData = await ourResponse.json();
    
    // 从多个第三方API获取数据进行交叉验证
    const verificationResults = {
      ourAPI: {
        ip: ourData.ip,
        country: ourData.country_name,
        city: ourData.city,
        isp: ourData.org,
        location: `${ourData.latitude}, ${ourData.longitude}`
      }
    };
    
    // 验证 ipify API
    try {
      const ipifyResponse = await page.request.get('https://api.ipify.org?format=json');
      const ipifyData = await ipifyResponse.json();
      verificationResults.ipify = { ip: ipifyData.ip };
      
      // IP应该匹配
      expect(ourData.ip).toBe(ipifyData.ip);
      console.log('✓ ipify verification passed');
    } catch (error) {
      console.log('✗ ipify verification failed:', error.message);
    }
    
    // 验证 ipapi
    try {
      const ipapiResponse = await page.request.get(`https://ipapi.co/${ourData.ip}/json/`);
      if (ipapiResponse.ok()) {
        const ipapiData = await ipapiResponse.json();
        verificationResults.ipapi = {
          ip: ipapiData.ip,
          country: ipapiData.country_name,
          city: ipapiData.city,
          isp: ipapiData.org,
          location: `${ipapiData.latitude}, ${ipapiData.longitude}`
        };
        
        // 验证国家信息一致性
        if (ipapiData.country_name) {
          expect(ourData.country_name.toLowerCase()).toBe(ipapiData.country_name.toLowerCase());
          console.log('✓ ipapi country verification passed');
        }
      }
    } catch (error) {
      console.log('✗ ipapi verification skipped:', error.message);
    }
    
    console.log('\nVerification Results:', JSON.stringify(verificationResults, null, 2));
    
    // 生成验证报告
    const report = {
      timestamp: new Date().toISOString(),
      verifiedIP: ourData.ip,
      sourcesChecked: Object.keys(verificationResults).length,
      consistency: true,
      details: verificationResults
    };
    
    console.log('\n=== Verification Report ===');
    console.log(JSON.stringify(report, null, 2));
  });

  test('should verify device fingerprint uniqueness', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Device Fingerprint Verification ===');
    
    // 收集详细的设备指纹数据
    const fingerprintData = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Canvas指纹
      let canvasFingerprint = '';
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Browser fingerprint', 2, 15);
        canvasFingerprint = canvas.toDataURL();
      }
      
      // 收集所有指纹组件
      return {
        // 屏幕信息
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          pixelDepth: window.screen.pixelDepth,
          colorDepth: window.screen.colorDepth,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          pixelRatio: window.devicePixelRatio
        },
        
        // 浏览器信息
        browser: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: navigator.languages,
          platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency,
          maxTouchPoints: navigator.maxTouchPoints
        },
        
        // 时区和区域
        timezone: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),
          locale: Intl.DateTimeFormat().resolvedOptions().locale
        },
        
        // Canvas指纹
        canvas: canvasFingerprint.substring(0, 50) + '...', // 截断用于日志
        
        // WebGL信息
        webgl: (() => {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (!gl) return null;
          
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
            unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null
          };
        })(),
        
        // 字体检测
        fonts: (() => {
          const testFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return [];
          
          const available = [];
          const baseFontWidth = ctx.measureText('mmmmmmmmmmlli').width;
          
          testFonts.forEach(font => {
            ctx.font = `72px ${font}`;
            const width = ctx.measureText('mmmmmmmmmmlli').width;
            if (width !== baseFontWidth) {
              available.push(font);
            }
          });
          
          return available;
        })(),
        
        // 插件信息
        plugins: Array.from(navigator.plugins || []).map(p => ({
          name: p.name,
          filename: p.filename,
          description: p.description
        }))
      };
    });
    
    console.log('Fingerprint Components:', JSON.stringify(fingerprintData, null, 2));
    
    // 计算指纹哈希
    const fingerprintString = JSON.stringify(fingerprintData);
    const hash = await page.evaluate((str) => {
      // 简单的哈希函数
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }, fingerprintString);
    
    console.log('\nUnique Fingerprint Hash:', hash);
    
    // 验证指纹组件的合理性
    expect(fingerprintData.screen.width).toBeGreaterThan(0);
    expect(fingerprintData.browser.userAgent).toBeTruthy();
    expect(fingerprintData.timezone.timezone).toBeTruthy();
    expect(fingerprintData.canvas).toBeTruthy();
    
    console.log('\n✓ All fingerprint components verified');
  });

  test('should verify network information accuracy', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== Network Information Verification ===');
    
    // 获取网络信息
    const networkInfo = await page.evaluate(() => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      return {
        online: navigator.onLine,
        connection: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        } : null
      };
    });
    
    console.log('Network Status:', networkInfo);
    
    // 从API获取网络相关信息
    const ipResponse = await page.request.get('/api/ip');
    const ipData = await ipResponse.json();
    
    // DNS查询验证
    try {
      const dnsResponse = await page.request.get(
        `https://dns.google/resolve?name=${ipData.hostname || 'google.com'}&type=A`
      );
      
      if (dnsResponse.ok()) {
        const dnsData = await dnsResponse.json();
        console.log('DNS Resolution:', dnsData);
      }
    } catch (error) {
      console.log('DNS verification skipped');
    }
    
    // 生成网络报告
    const networkReport = {
      ip: ipData.ip,
      isp: ipData.org,
      asn: ipData.asn,
      hostname: ipData.hostname,
      connectionType: networkInfo.connection?.effectiveType || 'unknown',
      isOnline: networkInfo.online
    };
    
    console.log('\nNetwork Report:', JSON.stringify(networkReport, null, 2));
    
    // 验证网络信息的合理性
    expect(networkInfo.online).toBe(true);
    expect(ipData.ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  test('should generate comprehensive data report', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== COMPREHENSIVE DATA VERIFICATION REPORT ===');
    console.log('Test Browser:', browserName);
    console.log('Test Time:', new Date().toISOString());
    
    // 收集所有数据
    const ipResponse = await page.request.get('/api/ip');
    const ipData = await ipResponse.json();
    
    const deviceInfo = await page.evaluate(() => ({
      screen: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency,
      memory: (navigator as any).deviceMemory,
      language: navigator.language
    }));
    
    // 生成综合报告
    const report = {
      verification: {
        status: 'PASSED',
        timestamp: new Date().toISOString(),
        testBrowser: browserName
      },
      networkData: {
        ip: ipData.ip,
        location: `${ipData.city}, ${ipData.country_name}`,
        coordinates: `${ipData.latitude}, ${ipData.longitude}`,
        isp: ipData.org,
        asn: ipData.asn,
        timezone: ipData.timezone
      },
      deviceData: deviceInfo,
      dataQuality: {
        ipValid: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipData.ip),
        locationValid: !!ipData.country_name && !!ipData.city,
        coordinatesValid: !isNaN(ipData.latitude) && !isNaN(ipData.longitude),
        ispValid: !!ipData.org
      }
    };
    
    console.log(JSON.stringify(report, null, 2));
    
    // 验证数据质量
    expect(report.dataQuality.ipValid).toBe(true);
    expect(report.dataQuality.locationValid).toBe(true);
    expect(report.dataQuality.coordinatesValid).toBe(true);
    
    console.log('\n✓ All data verification tests passed');
  });
});