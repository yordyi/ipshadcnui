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
      <Card className="w-full max-w-md mx-auto mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ipInfo) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">My IP:</span>
            <span className="text-2xl">{getFlagEmoji(ipInfo.countryCode)}</span>
            <span className="text-xl font-bold">{ipInfo.ip}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-base">{getFlagEmoji(ipInfo.countryCode)}</span>
          <span>{ipInfo.city} / {ipInfo.country}</span>
        </div>
      </CardContent>
    </Card>
  );
}