"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Monitor, 
  Palette, 
  Volume2, 
  Database,
  Type,
  Calculator,
  Puzzle,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface BrowserFingerprint {
  // 显示与图形
  screenResolution: string;
  screenFrame: string;
  colorDepth: string;
  colorGamut: string;
  canvas: string;
  webGlBasics: string;
  webGlExtensions: string;
  invertedColors: string;
  forcedColors: string;
  monochrome: string;
  contrast: string;
  reducedMotion: string;
  reducedTransparency: string;
  hdr: string;
  
  // 音频特征
  audio: string;
  
  // 存储与API
  sessionStorage: string;
  localStorage: string;
  indexedDB: string;
  openDatabase: string;
  cookiesEnabled: string;
  
  // 字体与文本
  fonts: string;
  fontPreferences: string;
  
  // 数学与计算
  math: string;
  
  // 浏览器功能
  plugins: string;
  pdfViewerEnabled: string;
  domBlockers: string;
  
  // 特殊功能
  applePay: string;
  privateClickMeasurement: string;
}

export default function BrowserFingerprintCard() {
  const [fingerprint, setFingerprint] = useState<BrowserFingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const getBrowserFingerprint = async () => {
      try {
        // 显示与图形检测
        const getDisplayGraphics = () => {
          const screen = window.screen;
          
          // 屏幕分辨率
          const screenResolution = `${screen.width}x${screen.height}`;
          
          // 屏幕边框
          const screenFrame = `${screen.availWidth}x${screen.availHeight}`;
          
          // 颜色深度
          const colorDepth = `${screen.colorDepth}-bit`;
          
          // 颜色空间
          const colorGamut = (() => {
            if (window.matchMedia && window.matchMedia('(color-gamut: rec2020)').matches) {
              return 'rec2020';
            } else if (window.matchMedia && window.matchMedia('(color-gamut: p3)').matches) {
              return 'p3';
            } else if (window.matchMedia && window.matchMedia('(color-gamut: srgb)').matches) {
              return 'srgb';
            }
            return 'unknown';
          })();
          
          // Canvas指纹
          const canvas = (() => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 280;
              canvas.height = 60;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // 复杂的Canvas指纹生成
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = '#f60';
                ctx.fillRect(125, 1, 62, 20);
                
                // 添加渐变
                const gradient = ctx.createLinearGradient(0, 0, 280, 0);
                gradient.addColorStop(0, '#f60');
                gradient.addColorStop(0.5, '#069');
                gradient.addColorStop(1, '#0f0');
                ctx.fillStyle = gradient;
                ctx.fillRect(187, 1, 91, 20);
                
                // 添加阴影
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // 多种字体和文本
                ctx.font = '11px Arial';
                ctx.fillStyle = '#069';
                ctx.fillText('Canvas fingerprint test 🎨', 2, 15);
                
                ctx.font = '18px Arial';
                ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
                ctx.fillText('Canvas fingerprint test 🎨', 4, 45);
                
                // 添加路径和形状
                ctx.beginPath();
                ctx.arc(50, 50, 20, 0, Math.PI * 2);
                ctx.stroke();
                
                // 添加贝塞尔曲线
                ctx.beginPath();
                ctx.moveTo(75, 25);
                ctx.quadraticCurveTo(100, 25, 100, 62.5);
                ctx.quadraticCurveTo(100, 100, 75, 100);
                ctx.quadraticCurveTo(25, 100, 25, 62.5);
                ctx.quadraticCurveTo(25, 25, 75, 25);
                ctx.stroke();
                
                // 生成更稳定的指纹
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let hash = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                  hash = ((hash << 5) - hash + imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] + imageData.data[i + 3]) & 0xffffffff;
                }
                return Math.abs(hash).toString(16).slice(0, 8);
              }
            } catch (e) {
              console.error('Canvas fingerprint error:', e);
            }
            return 'unavailable';
          })();
          
          // WebGL基础
          const webGlBasics = (() => {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              if (gl) {
                const webglContext = gl as WebGLRenderingContext;
                const vendor = webglContext.getParameter(webglContext.VENDOR);
                const renderer = webglContext.getParameter(webglContext.RENDERER);
                const version = webglContext.getParameter(webglContext.VERSION);
                const shadingLanguageVersion = webglContext.getParameter(webglContext.SHADING_LANGUAGE_VERSION);
                
                // 获取更多WebGL参数
                const maxVertexAttribs = webglContext.getParameter(webglContext.MAX_VERTEX_ATTRIBS);
                const maxTextureSize = webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE);
                const maxCubeMapSize = webglContext.getParameter(webglContext.MAX_CUBE_MAP_TEXTURE_SIZE);
                const maxViewportDims = webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS);
                
                return `${vendor} ${renderer} v${version} SL${shadingLanguageVersion} VA${maxVertexAttribs} T${maxTextureSize} C${maxCubeMapSize} V${maxViewportDims}`.substring(0, 80);
              }
            } catch (e) {
              console.error('WebGL error:', e);
            }
            return 'unavailable';
          })();
          
          // WebGL扩展
          const webGlExtensions = (() => {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              if (gl) {
                const webglContext = gl as WebGLRenderingContext;
                const extensions = webglContext.getSupportedExtensions();
                
                // 检查WebGL2支持
                const gl2 = canvas.getContext('webgl2');
                const webgl2Support = gl2 ? ' +WebGL2' : '';
                
                // 获取调试信息
                const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
                let debugDetails = '';
                if (debugInfo) {
                  const unmaskedVendor = webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                  const unmaskedRenderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                  debugDetails = ` (${unmaskedVendor} ${unmaskedRenderer})`;
                }
                
                return `${extensions ? extensions.length : 0} extensions${webgl2Support}${debugDetails}`.substring(0, 50);
              }
            } catch (e) {
              console.error('WebGL extensions error:', e);
            }
            return '0';
          })();
          
          // 反转颜色
          const invertedColors = window.matchMedia && window.matchMedia('(inverted-colors: inverted)').matches ? 'yes' : 'no';
          
          // 强制颜色
          const forcedColors = window.matchMedia && window.matchMedia('(forced-colors: active)').matches ? 'yes' : 'no';
          
          // 单色显示
          const monochrome = window.matchMedia && window.matchMedia('(monochrome)').matches ? 'yes' : 'no';
          
          // 对比度
          const contrast = (() => {
            if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
              return 'high';
            } else if (window.matchMedia && window.matchMedia('(prefers-contrast: low)').matches) {
              return 'low';
            }
            return 'normal';
          })();
          
          // 减少动画
          const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'yes' : 'no';
          
          // 减少透明度
          const reducedTransparency = window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)').matches ? 'yes' : 'no';
          
          // HDR支持
          const hdr = window.matchMedia && window.matchMedia('(dynamic-range: high)').matches ? 'yes' : 'no';
          
          return {
            screenResolution,
            screenFrame,
            colorDepth,
            colorGamut,
            canvas,
            webGlBasics,
            webGlExtensions,
            invertedColors,
            forcedColors,
            monochrome,
            contrast,
            reducedMotion,
            reducedTransparency,
            hdr
          };
        };
        
        // 音频特征检测
        const getAudioFingerprint = () => {
          try {
            // 使用OfflineAudioContext避免权限问题
            const offlineContext = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(1, 44100, 44100);
            
            // 创建音频节点
            const oscillator = offlineContext.createOscillator();
            const analyser = offlineContext.createAnalyser();
            const gainNode = offlineContext.createGain();
            const dynamicsCompressor = offlineContext.createDynamicsCompressor();
            const convolver = offlineContext.createConvolver();
            
            // 创建冲激响应
            const impulseLength = 2048;
            const impulseBuffer = offlineContext.createBuffer(1, impulseLength, offlineContext.sampleRate);
            const impulseData = impulseBuffer.getChannelData(0);
            for (let i = 0; i < impulseLength; i++) {
              impulseData[i] = Math.random() * 2 - 1;
            }
            convolver.buffer = impulseBuffer;
            
            // 连接音频节点
            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(dynamicsCompressor);
            dynamicsCompressor.connect(convolver);
            convolver.connect(offlineContext.destination);
            
            // 设置音频参数
            oscillator.frequency.value = 1000;
            oscillator.type = 'triangle';
            gainNode.gain.value = 0;
            
            // 设置压缩器参数
            dynamicsCompressor.threshold.value = -50;
            dynamicsCompressor.knee.value = 40;
            dynamicsCompressor.ratio.value = 12;
            dynamicsCompressor.attack.value = 0;
            dynamicsCompressor.release.value = 0.25;
            
            // 设置分析器
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            oscillator.start();
            
            // 渲染音频并生成指纹
            return offlineContext.startRendering().then((buffer) => {
              const channelData = buffer.getChannelData(0);
              let hash = 0;
              
              // 计算音频数据的哈希
              for (let i = 0; i < channelData.length; i += 100) {
                hash = ((hash << 5) - hash + Math.floor(channelData[i] * 1000000)) & 0xffffffff;
              }
              
              // 添加AudioContext属性
              const contextProperties = [
                offlineContext.sampleRate,
                offlineContext.length,
                offlineContext.numberOfChannels
              ].join(',');
              
              hash = ((hash << 5) - hash + contextProperties.length) & 0xffffffff;
              
              return Math.abs(hash).toString(16).slice(0, 8);
            }).catch(() => {
              // 如果OfflineAudioContext失败，使用基础方法
              const basicContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const baseInfo = basicContext.sampleRate.toString() + basicContext.state;
              let hash = 0;
              for (let i = 0; i < baseInfo.length; i++) {
                hash = ((hash << 5) - hash + baseInfo.charCodeAt(i)) & 0xffffffff;
              }
              return Math.abs(hash).toString(16).slice(0, 8);
            });
          } catch (e) {
            console.error('Audio fingerprint error:', e);
            return Promise.resolve('unavailable');
          }
        };
        
        // 存储与API检测
        const getStorageAPI = () => {
          const sessionStorage = typeof window.sessionStorage !== 'undefined' ? 'supported' : 'not supported';
          const localStorage = typeof window.localStorage !== 'undefined' ? 'supported' : 'not supported';
          const indexedDB = typeof window.indexedDB !== 'undefined' ? 'supported' : 'not supported';
          const openDatabase = typeof (window as any).openDatabase !== 'undefined' ? 'supported' : 'not supported';
          const cookiesEnabled = navigator.cookieEnabled ? 'enabled' : 'disabled';
          
          return {
            sessionStorage,
            localStorage,
            indexedDB,
            openDatabase,
            cookiesEnabled
          };
        };
        
        // 字体与文本检测
        const getFontPreferences = () => {
          const testFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia',
            'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black',
            'Impact', 'Lucida Console', 'Tahoma', 'Century Gothic', 'Lucida Sans Unicode',
            'Calibri', 'Cambria', 'Candara', 'Constantia', 'Corbel', 'Franklin Gothic Medium',
            'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
            'Noto Sans', 'Ubuntu', 'Droid Sans', 'Helvetica Neue', 'Lucida Grande',
            'Menlo', 'Monaco', 'Consolas', 'DejaVu Sans', 'Liberation Sans'
          ];
          
          const baseFonts = ['monospace', 'sans-serif', 'serif'];
          const testString = 'mmmmmmmmmmlli';
          const testSize = '72px';
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            return {
              fonts: '0 fonts',
              fontPreferences: 'unavailable'
            };
          }
          
          // 测量基础字体的宽度
          const baseFontWidths: { [key: string]: number } = {};
          baseFonts.forEach(font => {
            ctx.font = `${testSize} ${font}`;
            baseFontWidths[font] = ctx.measureText(testString).width;
          });
          
          // 检测可用字体
          const availableFonts = testFonts.filter(font => {
            return baseFonts.some(baseFont => {
              ctx.font = `${testSize} ${font}, ${baseFont}`;
              const width = ctx.measureText(testString).width;
              return width !== baseFontWidths[baseFont];
            });
          });
          
          // 获取字体渲染特性
          const fontPreferences = (() => {
            const styles = getComputedStyle(document.body);
            const fontFamily = styles.fontFamily || 'default';
            
            // 测试字体渲染特性
            const testCanvas = document.createElement('canvas');
            const testCtx = testCanvas.getContext('2d');
            if (testCtx) {
              testCtx.font = '14px Arial';
              testCtx.textBaseline = 'top';
              testCtx.fillText('Test', 0, 0);
              const imageData = testCtx.getImageData(0, 0, 20, 20);
              
              // 计算渲染特性哈希
              let hash = 0;
              for (let i = 0; i < imageData.data.length; i += 4) {
                hash = ((hash << 5) - hash + imageData.data[i]) & 0xffffffff;
              }
              
              return `${fontFamily} (${Math.abs(hash).toString(16).slice(0, 4)})`;
            }
            
            return fontFamily;
          })();
          
          return {
            fonts: `${availableFonts.length} fonts`,
            fontPreferences
          };
        };
        
        // 数学与计算检测
        const getMathFingerprint = () => {
          try {
            const operations = [
              Math.sin(Math.PI / 4),
              Math.cos(Math.PI / 4),
              Math.tan(Math.PI / 4),
              Math.sqrt(2),
              Math.log(2),
              Math.exp(1),
              Math.asin(0.5),
              Math.acos(0.5),
              Math.atan(1),
              Math.atan2(1, 1),
              Math.sinh(1),
              Math.cosh(1),
              Math.tanh(1),
              Math.asinh(1),
              Math.acosh(2),
              Math.atanh(0.5),
              Math.pow(2, 3),
              Math.log10(100),
              Math.log2(8),
              Math.cbrt(8),
              Math.hypot(3, 4),
              Math.trunc(4.9),
              Math.fround(1.5),
              Math.clz32(1),
              Math.imul(2, 3),
              Math.random() * 1000 % 1, // 随机数生成器特性
              parseFloat('1.23456789012345'),
              parseInt('15', 10),
              Number.MAX_SAFE_INTEGER / 2,
              Number.MIN_SAFE_INTEGER / 2,
              Number.EPSILON,
              Number.MAX_VALUE / 1e308,
              Number.MIN_VALUE * 1e308
            ];
            
            // 计算浮点精度特性
            const precisionTests = [
              0.1 + 0.2,
              0.1 + 0.2 - 0.3,
              1.0000000000000002 - 1,
              Math.PI,
              Math.E,
              Math.LN2,
              Math.LN10,
              Math.LOG2E,
              Math.LOG10E,
              Math.SQRT1_2,
              Math.SQRT2
            ];
            
            const allOperations = [...operations, ...precisionTests];
            
            // 生成更复杂的哈希
            let hash = 0;
            for (let i = 0; i < allOperations.length; i++) {
              const val = allOperations[i];
              const strVal = val.toString();
              for (let j = 0; j < strVal.length; j++) {
                hash = ((hash << 5) - hash + strVal.charCodeAt(j)) & 0xffffffff;
              }
            }
            
            // 添加时间戳微调（但保持稳定性）
            const timeBase = Math.floor(Date.now() / 3600000) * 3600000; // 每小时变化一次
            hash = ((hash << 5) - hash + timeBase) & 0xffffffff;
            
            return Math.abs(hash).toString(16).slice(-8);
          } catch (e) {
            console.error('Math fingerprint error:', e);
            return 'unavailable';
          }
        };
        
        // 浏览器功能检测
        const getBrowserFeatures = () => {
          const plugins = navigator.plugins ? navigator.plugins.length.toString() : '0';
          
          const pdfViewerEnabled = (() => {
            try {
              return navigator.mimeTypes && navigator.mimeTypes['application/pdf'] ? 'yes' : 'no';
            } catch (e) {
              return 'unknown';
            }
          })();
          
          const domBlockers = (() => {
            const blockerTests = [
              // 测试广告拦截器常见的CSS类名
              { className: 'adsbox', id: 'ads' },
              { className: 'ad-banner', id: 'banner' },
              { className: 'advertisement', id: 'advert' },
              { className: 'google-ads', id: 'googleads' },
              { className: 'sponsored', id: 'sponsor' }
            ];
            
            let detectedBlockers = 0;
            const testResults: string[] = [];
            
            blockerTests.forEach(test => {
              const testDiv = document.createElement('div');
              testDiv.innerHTML = '&nbsp;';
              testDiv.className = test.className;
              testDiv.id = test.id;
              testDiv.style.position = 'absolute';
              testDiv.style.left = '-9999px';
              testDiv.style.height = '10px';
              testDiv.style.width = '10px';
              
              document.body.appendChild(testDiv);
              
              // 检测元素是否被隐藏
              const computed = getComputedStyle(testDiv);
              const isBlocked = testDiv.offsetHeight === 0 || 
                               testDiv.offsetWidth === 0 ||
                               computed.display === 'none' ||
                               computed.visibility === 'hidden';
              
              if (isBlocked) {
                detectedBlockers++;
                testResults.push(test.className);
              }
              
              document.body.removeChild(testDiv);
            });
            
            // 额外检测：检查是否有AdBlock Plus或uBlock Origin的特征
            const hasAdBlockPlus = typeof (window as any).adblockplus !== 'undefined';
            const hasUBlockOrigin = typeof (window as any).uBO_noopFn !== 'undefined';
            
            if (hasAdBlockPlus) testResults.push('ABP');
            if (hasUBlockOrigin) testResults.push('uBO');
            
            const totalDetected = detectedBlockers + (hasAdBlockPlus ? 1 : 0) + (hasUBlockOrigin ? 1 : 0);
            
            if (totalDetected === 0) {
              return 'not detected';
            } else if (totalDetected <= 2) {
              return `detected (${totalDetected})`;
            } else {
              return `detected (${totalDetected}+)`;
            }
          })();
          
          return {
            plugins,
            pdfViewerEnabled,
            domBlockers
          };
        };
        
        // 特殊功能检测
        const getSpecialFeatures = () => {
          const applePay = (window as any).ApplePaySession ? 'supported' : 'not supported';
          const privateClickMeasurement = 'HTMLAnchorElement' in window && 'attributionSourceId' in HTMLAnchorElement.prototype ? 'supported' : 'not supported';
          
          return {
            applePay,
            privateClickMeasurement
          };
        };
        
        // 获取所有数据
        const displayGraphics = getDisplayGraphics();
        const audio = await getAudioFingerprint();
        const storageAPI = getStorageAPI();
        const fontData = getFontPreferences();
        const math = getMathFingerprint();
        const browserFeatures = getBrowserFeatures();
        const specialFeatures = getSpecialFeatures();
        
        const fingerprintData: BrowserFingerprint = {
          ...displayGraphics,
          audio,
          ...storageAPI,
          ...fontData,
          math,
          ...browserFeatures,
          ...specialFeatures
        };
        
        setFingerprint(fingerprintData);
      } catch (error) {
        console.error('Failed to get browser fingerprint:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getBrowserFingerprint();
  }, []);

  if (loading) {
    return (
      <Card className="enhanced-card w-full">
        <CardHeader className="enhanced-card-header pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="info-icon">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-gradient">Browser Fingerprint Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="fingerprint-section">
                <div className="fingerprint-section-header">
                  <div className="flex items-center gap-3">
                    <div className="loading-shimmer h-8 w-8 rounded-lg"></div>
                    <div className="loading-shimmer h-4 rounded w-32"></div>
                    <div className="ml-auto loading-shimmer h-6 w-16 rounded-full"></div>
                  </div>
                  <div className="loading-shimmer h-4 w-4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fingerprint) {
    return null;
  }

  const sections = [
    {
      title: "Display & Graphics",
      icon: <Monitor className="h-4 w-4" />,
      items: [
        { label: "Screen Resolution", value: fingerprint.screenResolution },
        { label: "Screen Frame", value: fingerprint.screenFrame },
        { label: "Color Depth", value: fingerprint.colorDepth },
        { label: "Color Gamut", value: fingerprint.colorGamut },
        { label: "Canvas", value: fingerprint.canvas },
        { label: "WebGL Basics", value: fingerprint.webGlBasics },
        { label: "WebGL Extensions", value: fingerprint.webGlExtensions },
        { label: "Inverted Colors", value: fingerprint.invertedColors },
        { label: "Forced Colors", value: fingerprint.forcedColors },
        { label: "Monochrome", value: fingerprint.monochrome },
        { label: "Contrast", value: fingerprint.contrast },
        { label: "Reduced Motion", value: fingerprint.reducedMotion },
        { label: "Reduced Transparency", value: fingerprint.reducedTransparency },
        { label: "HDR", value: fingerprint.hdr }
      ]
    },
    {
      title: "Audio Features",
      icon: <Volume2 className="h-4 w-4" />,
      items: [
        { label: "Audio Fingerprint", value: fingerprint.audio }
      ]
    },
    {
      title: "Storage & API",
      icon: <Database className="h-4 w-4" />,
      items: [
        { label: "Session Storage", value: fingerprint.sessionStorage },
        { label: "Local Storage", value: fingerprint.localStorage },
        { label: "IndexedDB", value: fingerprint.indexedDB },
        { label: "OpenDatabase", value: fingerprint.openDatabase },
        { label: "Cookies", value: fingerprint.cookiesEnabled }
      ]
    },
    {
      title: "Fonts & Text",
      icon: <Type className="h-4 w-4" />,
      items: [
        { label: "Available Fonts", value: fingerprint.fonts },
        { label: "Font Preferences", value: fingerprint.fontPreferences }
      ]
    },
    {
      title: "Math & Computation",
      icon: <Calculator className="h-4 w-4" />,
      items: [
        { label: "Math Fingerprint", value: fingerprint.math }
      ]
    },
    {
      title: "Browser Features",
      icon: <Puzzle className="h-4 w-4" />,
      items: [
        { label: "Plugins", value: fingerprint.plugins },
        { label: "PDF Viewer", value: fingerprint.pdfViewerEnabled },
        { label: "DOM Blockers", value: fingerprint.domBlockers }
      ]
    },
    {
      title: "Special Features",
      icon: <Shield className="h-4 w-4" />,
      items: [
        { label: "Apple Pay", value: fingerprint.applePay },
        { label: "Private Click Measurement", value: fingerprint.privateClickMeasurement }
      ]
    }
  ];

  return (
    <Card className="enhanced-card w-full">
      <CardHeader className="enhanced-card-header pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="info-icon">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-gradient">Browser Fingerprint Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="fingerprint-section" style={{"--stagger-delay": sectionIndex} as React.CSSProperties}>
              <div 
                className="fingerprint-section-header"
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-enhanced">
                  <div className="info-icon text-indigo-600 dark:text-indigo-400">
                    {section.icon}
                  </div>
                  <span>{section.title}</span>
                  <div className="ml-auto px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                    {section.items.length} items
                  </div>
                </div>
                <div className="text-muted-foreground transition-transform duration-200" style={{transform: expandedSections[sectionIndex] ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
              
              {expandedSections[sectionIndex] && (
                <div className="fingerprint-section-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="info-item" style={{"--stagger-delay": itemIndex} as React.CSSProperties}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-secondary-enhanced">
                            {item.label}:
                          </span>
                          <span className="text-sm font-semibold text-enhanced text-right max-w-[60%] truncate">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}