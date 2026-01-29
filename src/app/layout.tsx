import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Flights Above Me",
    description: "Track flights flying above your current location",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
