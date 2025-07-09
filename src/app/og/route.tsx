import { loadGlobalSettings } from '@/lib/contentful';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const data = await loadGlobalSettings();
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Default Title';
  const absIconUrl = new URL(data.avatar ?? "", request.url).href;

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          color: '#dddddd',
          background: '#196355',
          padding: '50px',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: '"Noto Sans JP"',
        }}
      >
        <div style={{
          background: '#111111',
          width: '100%',
          height: '100%',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div tw="mb-8 mx-4">{title}</div>
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