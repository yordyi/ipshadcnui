import IPLocationCard from "@/components/ip-location-card";
import DeviceInfoCard from "@/components/device-info-card";
import SummaryCard from "@/components/summary-card";
import BrowserFingerprintCard from "@/components/browser-fingerprint-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 p-2 md:p-6">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2 text-shadow">
            Device Information Portal
          </h1>
          <p className="text-lg text-muted-foreground/80">
            Comprehensive system and network analysis dashboard
          </p>
        </div>
        
        {/* IP信息卡片 - 顶部居中 - Enhanced */}
        <div className="flex justify-center mb-8 animate-fadeInUp">
          <div className="w-full max-w-md">
            <IPLocationCard />
          </div>
        </div>
        
        {/* 主要内容区域 - 两列布局 - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger-animation">
          {/* 设备信息卡片 - 占据2列 */}
          <div className="lg:col-span-2 animate-fadeInUp" style={{"--stagger-delay": "1"} as React.CSSProperties}>
            <DeviceInfoCard />
          </div>
          
          {/* Summary卡片 - 占据1列 */}
          <div className="lg:col-span-1 animate-fadeInUp" style={{"--stagger-delay": "2"} as React.CSSProperties}>
            <SummaryCard />
          </div>
        </div>
        
        {/* Browser Fingerprint卡片 - 全宽度 - Enhanced */}
        <div className="animate-fadeInUp" style={{"--stagger-delay": "3"} as React.CSSProperties}>
          <BrowserFingerprintCard />
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground/60">
            Powered by modern web technologies • Real-time system analysis
          </p>
        </div>
      </div>
    </div>
  );
}