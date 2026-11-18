import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Try the demos";

export default function Image() {
  return renderOg({ title: "Try the demos", eyebrow: "AI Front Desk and Lead Autopilot" });
}
