import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "About The Yellow Works";

export default function Image() {
  return renderOg({ title: "About The Yellow Works", eyebrow: "Founder-led studio in Hyderabad" });
}
