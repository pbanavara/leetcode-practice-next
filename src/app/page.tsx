'use client';
import HomeHero from '@/components/HomeHero';
import ProblemSetSelector from '@/components/ProblemSelector';
import MainSession from '@/components/MainSession';
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