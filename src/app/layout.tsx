import './globals.css'
import SessionWrapper from '@/app/components/SessionWrapper';
import { Analytics } from  '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
          <Analytics />
        </SessionWrapper>
      </body>
    </html>
  )
}
