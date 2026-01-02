import { loadGlobalSettings } from '@/lib/cms';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const data = await loadGlobalSettings();
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Default Title';
  const bgImageUrl = searchParams.get('bgImage') || null;
  const absIconUrl = new URL(data.avatar ?? "", request.url).href;

  return new ImageResponse(
    (
      <div tw="w-full h-full p-16 text-6xl text-white bg-[#ED5126] flex">
        <div tw="w-full h-full bg-[#020C15] flex flex-col rounded-3xl items-center justify-center relative">
          {
            /* eslint-disable-next-line @next/next/no-img-element */
            bgImageUrl && <img
              src={bgImageUrl}
              alt="Background"
              tw="absolute inset-0 w-full h-full rounded-3xl"
              style={{ filter: "brightness(0.7) blur(5px)", objectFit: "cover" }}
            />
          }
          <div tw="mb-8 mx-4 text-center">{title}</div>
          <div tw="flex">
            {
              /* eslint-disable-next-line @next/next/no-img-element */
              data.avatar && <img
                src={absIconUrl}
                alt="Logo"
                width="80"
                height="80"
                tw="rounded-full"
              />
            }
            <div tw="flex text-4xl items-center justify-center text-center px-4">
              {data.author}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}