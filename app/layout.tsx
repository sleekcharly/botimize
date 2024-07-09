import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import ApolloProviderWrapper from '@/components/ApolloProvider';

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
          </body>
        </html>
      </ClerkProvider>
    </ApolloProviderWrapper>
  );
}
