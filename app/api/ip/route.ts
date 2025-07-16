import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the client's IP from the request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0] : real;

    console.log('Client IP from headers:', clientIp);

    // List of IP APIs to try
    const ipApis = [
      {
        url: 'https://api.ipify.org?format=json',
        parseIp: (data: any) => data.ip
      },
      {
        url: 'https://api.my-ip.io/ip.json',
        parseIp: (data: any) => data.ip
      },
      {
        url: 'https://ip.seeip.org/json',
        parseIp: (data: any) => data.ip
      },
      {
        url: 'https://api.bigdatacloud.net/data/client-ip',
        parseIp: (data: any) => data.ipString
      }
    ];

    let detectedIp = null;

    // Try to get IP from different APIs
    for (const api of ipApis) {
      try {
        const response = await fetch(api.url);
        if (response.ok) {
          const data = await response.json();
          detectedIp = api.parseIp(data);
          if (detectedIp) {
            console.log(`Got IP ${detectedIp} from ${api.url}`);
            break;
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from ${api.url}:`, err);
      }
    }

    // Use client IP if available and it's not localhost
    if (clientIp && clientIp !== '::1' && !clientIp.startsWith('127.')) {
      detectedIp = clientIp;
    }

    if (!detectedIp) {
      throw new Error('Could not detect IP');
    }

    // Now try to get location data
    const locationApis = [
      {
        url: `https://ipwho.is/${detectedIp}`,
        parseData: (data: any) => ({
          ip: data.ip,
          country_name: data.country,
          country_code: data.country_code,
          city: data.city,
          region: data.region,
          org: data.connection?.org || 'Unknown',
          asn: data.connection?.asn || 'Unknown',
          timezone: data.timezone?.id || 'Unknown',
          latitude: data.latitude,
          longitude: data.longitude,
          hostname: data.connection?.domain || 'Unknown'
        })
      },
      {
        url: `https://api.bigdatacloud.net/data/ip-geolocation?ip=${detectedIp}&localityLanguage=en&key=free`,
        parseData: (data: any) => ({
          ip: data.ip,
          country_name: data.country?.name || 'Unknown',
          country_code: data.country?.isoAlpha2 || 'XX',
          city: data.city?.name || data.locality || 'Unknown',
          region: data.principalSubdivision || '',
          org: data.network?.organisation || 'Unknown',
          asn: data.network?.carriers?.[0]?.asn || 'Unknown',
          timezone: data.location?.timeZone?.localTime || 'Unknown',
          latitude: data.location?.latitude,
          longitude: data.location?.longitude,
          hostname: detectedIp || 'Unknown'
        })
      },
      {
        url: `https://freeipapi.com/api/json/${detectedIp}`,
        parseData: (data: any) => ({
          ip: data.ipAddress,
          country_name: data.countryName,
          country_code: data.countryCode,
          city: data.cityName,
          region: data.regionName,
          org: 'Unknown',
          asn: 'Unknown',
          timezone: data.timeZone,
          latitude: data.latitude,
          longitude: data.longitude,
          hostname: detectedIp || 'Unknown'
        })
      }
    ];

    // Try to get location data
    for (const api of locationApis) {
      try {
        const response = await fetch(api.url);
        if (response.ok) {
          const data = await response.json();
          const parsedData = api.parseData(data);
          
          // Verify we have at least basic info
          if (parsedData.ip && parsedData.country_name !== 'Unknown') {
            console.log(`Got location data from ${api.url}`);
            return NextResponse.json(parsedData);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch from ${api.url}:`, err);
      }
    }

    // If all else fails, return IP with unknown location
    return NextResponse.json({
      ip: detectedIp,
      country_name: 'Unknown',
      country_code: 'XX',
      city: 'Unknown',
      region: '',
      org: 'Unknown',
      asn: 'Unknown',
      timezone: 'Unknown',
      hostname: detectedIp || 'Unknown',
      error: 'Could not determine location'
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        ip: 'Unable to detect',
        country_name: 'Unknown',
        country_code: 'XX',
        city: 'Unknown',
        error: 'Failed to fetch IP information' 
      },
      { status: 500 }
    );
  }
}