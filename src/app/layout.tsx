import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "RoadTag Data Visualizer | Made by ClaRity",
    description:
        "Interactive map visualization of tagged locations across Malaysia with satellite imagery and detailed information.",
    keywords: ["Malaysia", "map", "locations", "visualization", "coordinates"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
