import "./globals.css";
import { allMetaData } from "./utils/pwa-metadata";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata = allMetaData;
export const viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        id="app"
        className={`${manrope.variable} relative flex h-dvh w-dvw flex-row items-center justify-center bg-gradient-to-tl from-indigo-100 to-stone-300 antialiased md:p-4`}
      >
        {children}
      </body>
    </html>
  );
}
