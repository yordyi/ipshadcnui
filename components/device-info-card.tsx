"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Monitor, 
  Globe, 
  Clock, 
  Wifi, 
  Server,
  Languages,
  MapPin,
  Camera,
  Navigation
} from "lucide-react";

interface DeviceInfo {
  // 左侧信息
  platform: string;
  browser: string;
  browserVersion: string;
  videocard: string;
  language: string;
  screenResolution: string;
  timezone: string;
  
  // 右侧信息
  webrtc: string;
  isp: string;
  dns: string;
  location: string;
  coordinates: string;
  timezoneConnection: string;
  
  // 其他信息
  deviceType: string;
  userAgent: string;
}

export default function DeviceInfoCard() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDeviceInfo = async () => {
      const nav = navigator as Navigator & {
        connection?: { effectiveType?: string };
        mozConnection?: { effectiveType?: string };
        webkitConnection?: { effectiveType?: string };
        deviceMemory?: number;
        hardwareConcurrency?: number;
      };
      const screen = window.screen;
      
      // 检测浏览器
      const getBrowserInfo = () => {
        const userAgent = nav.userAgent;
        let browser = "Unknown";
        let version = "Unknown";
        
        if (userAgent.includes("Chrome")) {
          browser = "Chrome";
          version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Firefox")) {
          browser = "Firefox";
          version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
          browser = "Safari";
          version = userAgent.match(/Version\/(\d+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Edge")) {
          browser = "Edge";
          version = userAgent.match(/Edge\/(\d+)/)?.[1] || "Unknown";
        }
        
        return { browser, version };
      };

      // 检测设备类型
      const getDeviceType = () => {
        const userAgent = nav.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
          return "Tablet";
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
          return "Mobile";
        } else {
          return "Desktop";
        }
      };

      // 检测操作系统
      const getPlatform = () => {
        const userAgent = nav.userAgent;
        if (userAgent.includes("Windows")) return "Windows";
        if (userAgent.includes("Mac")) return "macOS";
        if (userAgent.includes("Linux")) return "Linux";
        if (userAgent.includes("Android")) return "Android";
        if (userAgent.includes("iOS")) return "iOS";
        return "Unknown";
      };

      // 获取显卡信息
      const getVideocard = () => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl && 'getExtension' in gl) {
            const webglContext = gl as WebGLRenderingContext;
            const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
              return renderer || "Unknown";
            }
          }
        } catch (e) {
          console.error('Failed to get GPU info:', e);
        }
        return "Unknown";
      };

      // 检测WebRTC支持
      const getWebRTCSupport = () => {
        const win = window as Window & {
          webkitRTCPeerConnection?: unknown;
          mozRTCPeerConnection?: unknown;
        };
        if (typeof RTCPeerConnection !== 'undefined') {
          return "✅ Supported";
        } else if (typeof win.webkitRTCPeerConnection !== 'undefined') {
          return "✅ Supported (webkit)";
        } else if (typeof win.mozRTCPeerConnection !== 'undefined') {
          return "✅ Supported (moz)";
        } else {
          return "❌ Not Supported";
        }
      };

      // 获取DNS信息
      const getDNSInfo = async () => {
        try {
          // 尝试使用Google DNS over HTTPS API
          const response = await fetch('https://dns.google/resolve?name=google.com&type=A');
          const data = await response.json();
          return data.Status === 0 ? "8.8.8.8 (Google)" : "Unknown";
        } catch {
          try {
            // 尝试使用Cloudflare DNS over HTTPS API
            const response = await fetch('https://cloudflare-dns.com/dns-query?name=google.com&type=A', {
              headers: { 'Accept': 'application/dns-json' }
            });
            const data = await response.json();
            return data.Status === 0 ? "1.1.1.1 (Cloudflare)" : "Unknown";
          } catch (error2) {
            console.error('Failed to fetch DNS info:', error2);
            return "Unknown";
          }
        }
      };

      // 获取IP信息
      let ipData = null;
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        ipData = await ipResponse.json();
      } catch (error) {
        console.error('Failed to fetch IP data:', error);
      }

      // 获取DNS信息
      const dnsInfo = await getDNSInfo();

      // 获取国旗emoji
      const getFlagEmoji = (countryCode: string) => {
        if (!countryCode || countryCode.length !== 2) return "";
        return countryCode
          .toUpperCase()
          .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
      };

      // 获取时区所在国家的国旗
      const getTimezoneFlag = (timezone: string) => {
        // 简单的时区到国家映射
        const timezoneToCountry: { [key: string]: string } = {
          'America/New_York': 'US',
          'America/Chicago': 'US',
          'America/Denver': 'US',
          'America/Los_Angeles': 'US',
          'Europe/London': 'GB',
          'Europe/Paris': 'FR',
          'Europe/Berlin': 'DE',
          'Europe/Rome': 'IT',
          'Europe/Moscow': 'RU',
          'Asia/Tokyo': 'JP',
          'Asia/Shanghai': 'CN',
          'Asia/Hong_Kong': 'HK',
          'Asia/Seoul': 'KR',
          'Asia/Kolkata': 'IN',
          'Australia/Sydney': 'AU',
          'Asia/Singapore': 'SG',
          'Asia/Bangkok': 'TH',
          'Asia/Dubai': 'AE',
        };
        
        const countryCode = timezoneToCountry[timezone];
        return countryCode ? getFlagEmoji(countryCode) : "";
      };

      const { browser, version } = getBrowserInfo();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryFlag = ipData?.country_code ? getFlagEmoji(ipData.country_code) : "";
      const timezoneFlag = getTimezoneFlag(userTimezone);
      
      const info: DeviceInfo = {
        // 左侧信息
        platform: getPlatform(),
        browser: `${browser} ${version}`,
        browserVersion: version,
        videocard: getVideocard(),
        language: nav.language || "Unknown",
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: `${timezoneFlag} ${userTimezone}`,
        
        // 右侧信息
        webrtc: getWebRTCSupport(),
        isp: ipData?.org || "Unknown",
        dns: dnsInfo,
        location: ipData ? `${countryFlag} ${ipData.city}, ${ipData.country_name}` : "Unknown",
        coordinates: ipData ? `${ipData.latitude}, ${ipData.longitude}` : "Unknown",
        timezoneConnection: ipData?.timezone ? `${countryFlag} ${ipData.timezone}` : "Unknown",
        
        // 其他信息
        deviceType: getDeviceType(),
        userAgent: nav.userAgent
      };

      setDeviceInfo(info);
      setLoading(false);
    };

    getDeviceInfo();
  }, []);

  const getPlatformFlag = (platform: string) => {
    switch (platform) {
      case "Windows":
        return "🪟";
      case "macOS":
        return "🍎";
      case "Linux":
        return "🐧";
      case "Android":
        return "🤖";
      case "iOS":
        return "📱";
      default:
        return "💻";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deviceInfo) {
    return null;
  }

  // 左侧信息
  const leftItems = [
    {
      icon: <Monitor className="h-4 w-4" />,
      label: "Platform:",
      value: `${getPlatformFlag(deviceInfo.platform)} ${deviceInfo.platform}`
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "Browser:",
      value: deviceInfo.browser
    },
    {
      icon: <Camera className="h-4 w-4" />,
      label: "Videocard:",
      value: deviceInfo.videocard
    },
    {
      icon: <Languages className="h-4 w-4" />,
      label: "Language:",
      value: deviceInfo.language
    },
    {
      icon: <Monitor className="h-4 w-4" />,
      label: "Resolution:",
      value: deviceInfo.screenResolution
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Timezone:",
      value: deviceInfo.timezone
    }
  ];

  // 右侧信息
  const rightItems = [
    {
      icon: <Wifi className="h-4 w-4" />,
      label: "WebRTC:",
      value: deviceInfo.webrtc
    },
    {
      icon: <Server className="h-4 w-4" />,
      label: "ISP:",
      value: deviceInfo.isp
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "DNS:",
      value: deviceInfo.dns
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Location:",
      value: deviceInfo.location
    },
    {
      icon: <Navigation className="h-4 w-4" />,
      label: "Coordinates:",
      value: deviceInfo.coordinates
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Timezone connection:",
      value: deviceInfo.timezoneConnection
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Monitor className="h-4 w-4" />
          Device Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左侧信息 */}
          <div className="space-y-2">
            {leftItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-blue-600 dark:text-blue-400">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 右侧信息 */}
          <div className="space-y-2">
            {rightItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-green-600 dark:text-green-400">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}