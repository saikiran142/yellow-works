import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Built for businesses like yours";

export default function Image() {
  return renderOg({ title: "Built for businesses like yours", eyebrow: "Industries" });
}
