import { ImageResponse } from 'next/og';
import AppIcon from '@/components/app-icon';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam) || 512;

  return new ImageResponse(
    <AppIcon size={size} />,
    {
      width: size,
      height: size,
    }
  );
}