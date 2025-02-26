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
      <head>
        <meta name="google-site-verification" content="zk5gMxHa7suS8vf_vaYhvy9w6fhm_IX9zUtVX1N9eG0" />
      </head>
      <body>
        <SessionWrapper>
          {children}
          <Analytics />
        </SessionWrapper>
      </body>
    </html>
  )
}
