import { ImageResponse } from 'next/og';
import AppIcon from '@/components/app-icon';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size) || 512;

  return new ImageResponse(
    <AppIcon size={size} />,
    {
      width: size,
      height: size,
    }
  );
}