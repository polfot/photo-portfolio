import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Preview image shown when a link to the site is shared (Instagram, WhatsApp, Facebook, …),
// exported as /og.png so static hosts serve it with an image type.
// Generated once at build time from the logo: centred on white, the same white as the logo file.
export const dynamic = "force-static";

const LOGO_WIDTH = 640;

export async function GET() {
  const logo = await readFile(join(process.cwd(), "public", site.logo));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "white" }}>
        <img src={src} width={LOGO_WIDTH} alt="" />
      </div>
    ),
    { width: site.shareImage.width, height: site.shareImage.height },
  );
}
