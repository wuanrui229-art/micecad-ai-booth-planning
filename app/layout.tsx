import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const imageUrl = host ? `${protocol}://${host}/og-v2.png` : undefined;

  return {
    title: "MICECAD AI｜从展馆底图到可交付展位方案",
    description: "上传展馆底图，确认规划约束，比较候选方案，并衔接 MICECAD 专业绘制、编号、修改与销售交付。",
    icons: { icon: "/favicon.svg" },
    openGraph: imageUrl ? {
      title: "MICECAD AI｜从展馆底图到可交付展位方案",
      description: "AI 辅助需求理解，规则独立检查，专业人员确认交付。",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "MICECAD AI 展位规划工作台与展馆平面图" }],
    } : undefined,
    twitter: imageUrl ? { card: "summary_large_image", images: [imageUrl] } : undefined,
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
