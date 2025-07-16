import IPLocationCard from "@/components/ip-location-card";
import DeviceInfoCard from "@/components/device-info-card";
import SummaryCard from "@/components/summary-card";

export default function Home() {
  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="max-w-full mx-auto px-2 md:px-4">
        {/* IP信息卡片 - 顶部居中 */}
        <div className="flex justify-center mb-3">
          <IPLocationCard />
        </div>
        
        {/* 主要内容区域 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 设备信息卡片 - 占据2列 */}
          <div className="lg:col-span-2">
            <DeviceInfoCard />
          </div>
          
          {/* Summary卡片 - 占据1列 */}
          <div className="lg:col-span-1">
            <SummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}