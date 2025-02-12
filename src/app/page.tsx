'use client';
import HomeHero from '@/app/components/HomeHero';
import ProblemSetSelector from '@/app/components/ProblemSelector';
import { SessionProvider } from 'next-auth/react';

export default function Home() {
  
  return (
    <SessionProvider>
      <main>
        <HomeHero />
        <ProblemSetSelector />
      </main>
    </SessionProvider>
  );
}