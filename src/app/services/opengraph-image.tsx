import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Services";

export default function Image() {
  return renderOg({ title: "Services", eyebrow: "Get found · Convert every enquiry · Run on autopilot" });
}
