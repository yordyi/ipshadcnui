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
        console.log('Fetching IP info...');
        
        // Use our API route to avoid CORS issues
        const response = await fetch('/api/ip');
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('IP API response:', data);
        
        // Set the IP info with whatever data we have
        if (data && data.ip) {
          setIPInfo({
            ip: data.ip,
            country: data.country_name || 'Unknown',
            countryCode: data.country_code?.toLowerCase() || 'xx',
            city: data.city || 'Unknown'
          });
        } else {
          throw new Error('Unable to detect IP');
        }
      } catch (error) {
        console.error('Failed to fetch IP info:', error);
        // Fallback data when API fails
        setIPInfo({
          ip: 'Unable to detect',
          country: 'Connection Error',
          countryCode: 'xx',
          city: 'Unknown'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, []);

  const copyToClipboard = async () => {
    if (ipInfo && ipInfo.ip !== 'Unable to detect') {
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
    if (countryCode === 'xx' || !countryCode || countryCode.length !== 2) {
      return '🌐'; // Globe emoji for unknown locations
    }
    try {
      return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    } catch {
      return '🌐';
    }
  };

  if (loading) {
    return (
      <Card className="w-full shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background" data-testid="ip-location-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div>
                <div className="h-3 bg-muted rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div>
              <div className="h-3 bg-muted rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <div className="h-6 bg-muted rounded-full w-32 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ipInfo) {
    return null;
  }

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background" data-testid="ip-location-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFlagEmoji(ipInfo.countryCode)}</span>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Your IP Address</div>
              <div className="text-2xl font-bold text-primary">{ipInfo.ip}</div>
            </div>
          </div>
          {ipInfo.ip !== 'Unable to detect' && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-10 w-10 p-0 hover:bg-primary/10"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <span className="text-lg">{getFlagEmoji(ipInfo.countryCode)}</span>
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-semibold">
              {ipInfo.city !== 'Unknown' && ipInfo.country !== 'Unknown' 
                ? `${ipInfo.city} / ${ipInfo.country}`
                : ipInfo.country !== 'Unknown' 
                  ? ipInfo.country 
                  : ipInfo.city !== 'Unknown' 
                    ? ipInfo.city 
                    : 'Unknown Location'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connection Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}