import IPLocationCard from "@/components/ip-location-card";
import DeviceInfoCard from "@/components/device-info-card";

export default function Home() {
  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="max-w-full mx-auto px-2 md:px-4">
        {/* IP信息卡片 - 顶部居中 */}
        <div className="flex justify-center mb-3">
          <IPLocationCard />
        </div>
        
        {/* 设备信息卡片 - 全宽度 */}
        <DeviceInfoCard />
      </div>
    </div>
  );
}