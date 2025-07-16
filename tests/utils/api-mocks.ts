import { Page, Route } from '@playwright/test';

// 模拟的IP数据响应
export const mockIPResponses = {
  // 正常响应
  standard: {
    ip: '8.8.8.8',
    country_name: 'United States',
    country_code: 'US',
    city: 'Mountain View',
    region: 'California',
    org: 'Google LLC',
    asn: 'AS15169',
    timezone: 'America/Los_Angeles',
    latitude: 37.4056,
    longitude: -122.0775,
    postal: '94043',
    hostname: 'dns.google'
  },
  
  // 不同位置的响应
  tokyo: {
    ip: '210.157.1.13',
    country_name: 'Japan',
    country_code: 'JP',
    city: 'Tokyo',
    region: 'Tokyo',
    org: 'NTT Communications Corporation',
    asn: 'AS4713',
    timezone: 'Asia/Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    postal: '100-0001',
    hostname: 'example.jp'
  },
  
  // 部分数据缺失
  partial: {
    ip: '192.0.2.1',
    country_name: 'Unknown',
    country_code: 'XX',
    city: 'Unknown',
    region: '',
    org: 'Unknown',
    asn: 'Unknown',
    timezone: 'Unknown',
    latitude: 0,
    longitude: 0,
    postal: 'Unknown',
    hostname: 'Unknown'
  },
  
  // 错误响应
  error: {
    error: 'Failed to fetch IP information'
  }
};

// 第三方API响应模拟
export const thirdPartyAPIResponses = {
  ipify: {
    success: { ip: '8.8.8.8' },
    error: null
  },
  
  ipwho: {
    success: {
      ip: '8.8.8.8',
      success: true,
      country: 'United States',
      country_code: 'US',
      city: 'Mountain View',
      region: 'California',
      latitude: 37.4056,
      longitude: -122.0775,
      connection: {
        org: 'Google LLC',
        asn: 'AS15169',
        domain: 'dns.google'
      },
      timezone: {
        id: 'America/Los_Angeles'
      }
    },
    mismatch: {
      ip: '8.8.8.8',
      success: true,
      country: 'Canada', // 故意不匹配
      country_code: 'CA',
      city: 'Toronto',
      region: 'Ontario',
      latitude: 43.6532,
      longitude: -79.3832,
      connection: {
        org: 'Different ISP',
        asn: 'AS00000',
        domain: 'example.com'
      },
      timezone: {
        id: 'America/Toronto'
      }
    }
  },
  
  bigdatacloud: {
    success: {
      ip: '8.8.8.8',
      country: {
        name: 'United States',
        isoAlpha2: 'US'
      },
      city: {
        name: 'Mountain View'
      },
      principalSubdivision: 'California',
      network: {
        organisation: 'Google LLC',
        carriers: [{ asn: 'AS15169' }]
      },
      location: {
        latitude: 37.4056,
        longitude: -122.0775,
        timeZone: {
          localTime: '2024-01-01T12:00:00-08:00'
        }
      }
    }
  }
};

// Mock API responses
export async function mockAPIResponses(page: Page, scenario: 'success' | 'partial' | 'error' | 'mismatch' = 'success') {
  // Mock our internal API
  await page.route('/api/ip', async (route: Route) => {
    switch (scenario) {
      case 'success':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockIPResponses.standard)
        });
        break;
      case 'partial':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockIPResponses.partial)
        });
        break;
      case 'error':
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(mockIPResponses.error)
        });
        break;
      case 'mismatch':
        // 返回东京的数据，用于测试不一致性
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockIPResponses.tokyo)
        });
        break;
    }
  });
  
  // Mock external APIs
  await page.route('https://api.ipify.org*', async (route: Route) => {
    if (scenario === 'error') {
      await route.abort();
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(thirdPartyAPIResponses.ipify.success)
      });
    }
  });
  
  await page.route('https://ipwho.is/*', async (route: Route) => {
    if (scenario === 'error') {
      await route.abort();
    } else if (scenario === 'mismatch') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(thirdPartyAPIResponses.ipwho.mismatch)
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(thirdPartyAPIResponses.ipwho.success)
      });
    }
  });
  
  await page.route('https://api.bigdatacloud.net/data/ip-geolocation*', async (route: Route) => {
    if (scenario === 'error') {
      await route.abort();
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(thirdPartyAPIResponses.bigdatacloud.success)
      });
    }
  });
  
  // Mock DNS APIs
  await page.route('https://dns.google/resolve*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        Status: 0,
        Answer: [{ data: '8.8.8.8' }]
      })
    });
  });
  
  await page.route('https://cloudflare-dns.com/dns-query*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        Status: 0,
        Answer: [{ data: '1.1.1.1' }]
      })
    });
  });
}

// 验证数据一致性的辅助函数
export function validateDataConsistency(data1: any, data2: any): {
  isConsistent: boolean;
  differences: string[];
} {
  const differences: string[] = [];
  
  // 检查IP
  if (data1.ip !== data2.ip) {
    differences.push(`IP mismatch: ${data1.ip} vs ${data2.ip}`);
  }
  
  // 检查国家
  if (data1.country_name !== data2.country_name) {
    differences.push(`Country mismatch: ${data1.country_name} vs ${data2.country_name}`);
  }
  
  // 检查城市
  if (data1.city !== data2.city) {
    differences.push(`City mismatch: ${data1.city} vs ${data2.city}`);
  }
  
  // 检查坐标（允许小数点后4位的误差）
  const latDiff = Math.abs(data1.latitude - data2.latitude);
  const lonDiff = Math.abs(data1.longitude - data2.longitude);
  if (latDiff > 0.0001 || lonDiff > 0.0001) {
    differences.push(`Coordinates mismatch: (${data1.latitude}, ${data1.longitude}) vs (${data2.latitude}, ${data2.longitude})`);
  }
  
  return {
    isConsistent: differences.length === 0,
    differences
  };
}