"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
}

export default function IPLocationCard() {
  const [ipInfo, setIPInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setIPInfo({
          ip: data.ip,
          country: data.country_name,
          countryCode: data.country_code.toLowerCase(),
          city: data.city
        });
      } catch (error) {
        console.error('Failed to fetch IP info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, []);

  const copyToClipboard = async () => {
    if (ipInfo) {
      try {
        await navigator.clipboard.writeText(ipInfo.ip);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy IP:', error);
      }
    }
  };

  const getFlagEmoji = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  };

  if (loading) {
    return (
      <Card className="enhanced-card ip-location-card w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="loading-shimmer h-12 w-12 rounded-lg"></div>
              <div>
                <div className="loading-shimmer h-3 rounded w-20 mb-2"></div>
                <div className="loading-shimmer h-6 rounded w-32"></div>
              </div>
            </div>
            <div className="loading-shimmer h-10 w-10 rounded-lg"></div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/20">
            <div className="flex items-center gap-2">
              <div className="loading-shimmer h-5 w-5 rounded"></div>
              <div>
                <div className="loading-shimmer h-3 rounded w-16 mb-1"></div>
                <div className="loading-shimmer h-4 rounded w-24"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <div className="loading-shimmer h-6 rounded-full w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ipInfo) {
    return null;
  }

  return (
    <Card className="enhanced-card ip-location-card w-full animate-float">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="info-icon">
              <span className="text-2xl animate-pulse">{getFlagEmoji(ipInfo.countryCode)}</span>
            </div>
            <div>
              <div className="text-sm text-secondary-enhanced mb-1">Your IP Address</div>
              <div className="text-2xl font-bold text-gradient">{ipInfo.ip}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="btn-enhanced h-10 w-10 p-0 transition-all duration-300 hover:scale-110"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500 animate-pulse" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/20">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-pulse">{getFlagEmoji(ipInfo.countryCode)}</span>
            <div>
              <div className="text-sm text-secondary-enhanced">Location</div>
              <div className="font-semibold text-enhanced">{ipInfo.city} / {ipInfo.country}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="status-indicator status-online">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connection Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}