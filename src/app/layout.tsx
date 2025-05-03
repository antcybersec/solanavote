
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use a more standard font like Inter
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css'; // Keep wallet styles here
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SolanaWalletProvider } from '@/components/solana-wallet-provider'; // Import the provider

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use a CSS variable for the font
});


export const metadata: Metadata = {
  title: 'SolanaVote',
  description: 'Decentralized Voting on Solana',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // Standard Tailwind font class
          inter.variable // Apply font variable
        )}
      >
        {/* Wrap the main content with the Wallet Provider */}
        <SolanaWalletProvider>
            {/* Remove centering container from here, apply padding/max-width in page.tsx */}
            <main className="flex-1"> {/* Ensure main takes up available space */}
              {children}
            </main>
            <Toaster /> {/* Add Toaster component */}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}

    