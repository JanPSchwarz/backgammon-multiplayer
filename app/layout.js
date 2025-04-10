import "./globals.css";
import { allMetaData } from "./utils/pwa-metadata";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata = allMetaData;
export const viewport = {
  themeColor: "#FFFFFF",
  width: `device-width`,
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        id="app"
        className={`${manrope.variable} relative flex h-dvh w-dvw flex-row items-center justify-center overflow-hidden overscroll-none !scroll-auto bg-gradient-to-br from-amber-50 to-indigo-100 antialiased md:p-4`}
      >
        {children}
      </body>
    </html>
  );
}
