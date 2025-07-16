"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Hash,
  Server,
  Network,
  Building,
  Globe,
  Shield,
  Cloud,
  AlertTriangle
} from "lucide-react";

interface SummaryInfo {
  asn: string;
  hostname: string;
  range: string;
  company: string;
  hostedDomains: string;
  privacy: string;
  anycast: string;
  asnType: string;
  abuseContact: string;
}

export default function SummaryCard() {
  const [summaryInfo, setSummaryInfo] = useState<SummaryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSummaryInfo = async () => {
      try {
        console.log('Fetching summary info...');
        // 获取基本IP信息 from our API route
        const ipResponse = await fetch('/api/ip');
        
        if (!ipResponse.ok) {
          throw new Error(`HTTP error! status: ${ipResponse.status}`);
        }
        
        const ipData = await ipResponse.json();
        console.log('Summary IP API response:', ipData);
        
        // Check if we have valid data
        if (!ipData || ipData.error) {
          throw new Error(ipData?.error || 'No data received');
        }
        
        // Determine privacy status based on IP
        const getPrivacyStatus = (ip: string) => {
          if (!ip) return "Unknown";
          const parts = ip.split('.').map(Number);
          
          // Check private IP ranges
          if (
            (parts[0] === 10) ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168) ||
            (parts[0] === 127)
          ) {
            return "Private";
          }
          return "Public";
        };

        // Determine ASN type based on organization
        const getAsnType = (org: string) => {
          if (!org) return "Unknown";
          const orgLower = org.toLowerCase();
          
          if (orgLower.includes('university') || orgLower.includes('college') || orgLower.includes('edu')) {
            return "Educational";
          }
          if (orgLower.includes('government') || orgLower.includes('gov')) {
            return "Government";
          }
          if (orgLower.includes('hosting') || orgLower.includes('cloud') || orgLower.includes('datacenter')) {
            return "Hosting";
          }
          if (orgLower.includes('telecom') || orgLower.includes('isp') || orgLower.includes('broadband')) {
            return "ISP";
          }
          return "Commercial";
        };

        // Determine if Anycast based on known providers
        const getAnycastStatus = (org: string) => {
          if (!org) return "No";
          const orgLower = org.toLowerCase();
          const anycastProviders = ['cloudflare', 'google', 'amazon', 'fastly', 'akamai'];
          return anycastProviders.some(provider => orgLower.includes(provider)) ? "Yes" : "No";
        };

        // Estimate hosted domains
        const getHostedDomains = (org: string) => {
          if (!org) return "Unknown";
          const orgLower = org.toLowerCase();
          
          if (orgLower.includes('cloudflare')) return "10M+";
          if (orgLower.includes('google')) return "5M+";
          if (orgLower.includes('amazon') || orgLower.includes('aws')) return "3M+";
          if (orgLower.includes('microsoft')) return "2M+";
          if (orgLower.includes('hosting') || orgLower.includes('digitalocean')) return "100K+";
          if (orgLower.includes('isp') || orgLower.includes('telecom')) return "10K+";
          return "< 1K";
        };

        // Generate abuse contact
        const getAbuseContact = (org: string) => {
          if (!org) return "Unknown";
          const orgLower = org.toLowerCase();
          
          if (orgLower.includes('google')) return "abuse@google.com";
          if (orgLower.includes('cloudflare')) return "abuse@cloudflare.com";
          if (orgLower.includes('amazon')) return "abuse@amazon.com";
          if (orgLower.includes('microsoft')) return "abuse@microsoft.com";
          
          // Generate generic abuse email
          const domain = org.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          return `abuse@${domain}.com`;
        };
        
        // Extract real data from the API response
        const org = ipData.org || ipData.isp || ipData.company || "Unknown";
        const info: SummaryInfo = {
          asn: ipData.asn !== "Unknown" ? ipData.asn : "N/A",
          hostname: ipData.hostname || window.location.hostname || "localhost",
          range: ipData.ip && ipData.ip !== "Unknown" ? `${ipData.ip.split('.').slice(0, 3).join('.')}.0/24` : "N/A",
          company: org !== "Unknown" ? org : "N/A",
          hostedDomains: org !== "Unknown" ? getHostedDomains(org) : "N/A",
          privacy: ipData.ip ? getPrivacyStatus(ipData.ip) : "N/A",
          anycast: org !== "Unknown" ? getAnycastStatus(org) : "N/A",
          asnType: org !== "Unknown" ? getAsnType(org) : "N/A",
          abuseContact: org !== "Unknown" ? getAbuseContact(org) : "N/A"
        };

        setSummaryInfo(info);
      } catch (error) {
        console.error('Failed to fetch summary info:', error);
        // Fallback data when API fails
        const fallbackInfo: SummaryInfo = {
          asn: "N/A",
          hostname: window.location.hostname || "localhost",
          range: "N/A",
          company: "N/A",
          hostedDomains: "N/A",
          privacy: "N/A",
          anycast: "N/A",
          asnType: "N/A",
          abuseContact: "N/A"
        };
        setSummaryInfo(fallbackInfo);
      } finally {
        setLoading(false);
      }
    };

    getSummaryInfo();
  }, []);

  if (loading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            <span>Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaryInfo) {
    return null;
  }

  const summaryItems = [
    {
      icon: <Hash className="h-4 w-4" />,
      label: "ASN",
      value: summaryInfo.asn
    },
    {
      icon: <Server className="h-4 w-4" />,
      label: "Hostname",
      value: summaryInfo.hostname
    },
    {
      icon: <Network className="h-4 w-4" />,
      label: "Range",
      value: summaryInfo.range
    },
    {
      icon: <Building className="h-4 w-4" />,
      label: "Company",
      value: summaryInfo.company
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "Hosted domains",
      value: summaryInfo.hostedDomains
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Privacy",
      value: summaryInfo.privacy
    },
    {
      icon: <Cloud className="h-4 w-4" />,
      label: "Anycast",
      value: summaryInfo.anycast
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "ASN type",
      value: summaryInfo.asnType
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Abuse contact",
      value: summaryInfo.abuseContact
    }
  ];

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          <span>Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-purple-600 dark:text-purple-400 p-1 rounded">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>
              <div className="text-sm font-semibold text-right max-w-[60%] truncate">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}