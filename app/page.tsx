'use client';

import { useEffect } from 'react';
import IPLocationCard from "@/components/ip-location-card";
import DeviceInfoCard from "@/components/device-info-card";
import SummaryCard from "@/components/summary-card";
import BrowserFingerprintCard from "@/components/browser-fingerprint-card";

export default function Home() {
  useEffect(() => {
    console.log('Home page mounted');
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Device Information Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive system and network analysis dashboard
          </p>
        </div>
        
        
        {/* IP信息卡片 - 顶部居中 */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <IPLocationCard />
          </div>
        </div>
        
        {/* 主要内容区域 - 响应式网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* 设备信息卡片 - 移动端全宽，平板和桌面占据2列 */}
          <div className="col-span-1 md:col-span-2">
            <DeviceInfoCard />
          </div>
          
          {/* Summary卡片 - 移动端全宽，平板占据2列，桌面占据1列 */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <SummaryCard />
          </div>
        </div>
        
        {/* Browser Fingerprint卡片 - 全宽度 */}
        <div className="mb-8">
          <BrowserFingerprintCard />
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by modern web technologies • Real-time system analysis
          </p>
        </div>
      </div>
    </div>
  );
}