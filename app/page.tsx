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
        
        {/* Debug info */}
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            Debug: All components should be visible below
          </p>
        </div>
        
        {/* IP信息卡片 - 顶部居中 */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <div className="border-2 border-dashed border-red-300 p-2 rounded">
              <p className="text-xs text-red-500 mb-2">IP Location Card Container:</p>
              <IPLocationCard />
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 设备信息卡片 - 占据2列 */}
          <div className="lg:col-span-2">
            <div className="border-2 border-dashed border-blue-300 p-2 rounded">
              <p className="text-xs text-blue-500 mb-2">Device Info Card Container:</p>
              <DeviceInfoCard />
            </div>
          </div>
          
          {/* Summary卡片 - 占据1列 */}
          <div className="lg:col-span-1">
            <div className="border-2 border-dashed border-green-300 p-2 rounded">
              <p className="text-xs text-green-500 mb-2">Summary Card Container:</p>
              <SummaryCard />
            </div>
          </div>
        </div>
        
        {/* Browser Fingerprint卡片 - 全宽度 */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-purple-300 p-2 rounded">
            <p className="text-xs text-purple-500 mb-2">Browser Fingerprint Card Container:</p>
            <BrowserFingerprintCard />
          </div>
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