import { ImageResponse } from "next/og";
import { repositories } from "@/lib/repositories";

export const ogImageSize = { width: 1200, height: 630 };

export async function renderOgImage({ title, background }: { title: string; background?: string }) {
  const data = await repositories.siteSettings.get();
  return new ImageResponse(
    (
      <div tw="w-full h-full p-16 text-6xl text-white bg-[#ED5126] flex">
        <div tw="w-full h-full bg-[#020C15] flex flex-col rounded-3xl items-center justify-center relative">
          {
            /* eslint-disable-next-line @next/next/no-img-element */
            background && <img
              src={background}
              alt=""
              tw="absolute inset-0 w-full h-full rounded-3xl"
              style={{ filter: "brightness(0.7) blur(5px)", objectFit: "cover" }}
            />
          }
          <div tw="mb-8 mx-4 text-center">{title}</div>
          <div tw="flex">
            {
              /* eslint-disable-next-line @next/next/no-img-element */
              data.avatar && <img
                src={data.avatar}
                alt=""
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
    ogImageSize,
  );
}
