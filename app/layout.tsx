import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ApolloProviderWrapper from '@/components/ApolloProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Botimize',
  description: 'An AI assistant like no other',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ApolloProviderWrapper>
      <ClerkProvider>
        <html lang="en">
          <body className="min-h-screen flex">
            {children}
            {/* Toaster */}
            <Toaster position="bottom-center" />
          </body>
        </html>
      </ClerkProvider>
    </ApolloProviderWrapper>
  );
}
