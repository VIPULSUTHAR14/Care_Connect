// src/app/consult/[appointmentId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import VideoCall from '@/components/VideoCall'; // Make sure this path is correct

export default function ConsultationPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get appointmentId as a string
  const appointmentId = params?.appointmentId as string;

  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin');
      return;
    }
    
    if (status === 'authenticated' && appointmentId && session?.user?.id) {
      const numericUid = Math.abs(
        session.user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000000
      );
      setUid(numericUid);

      const fetchToken = async () => {
        try {
          const res = await fetch('/api/agora/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelName: appointmentId, // Now it's guaranteed to be a string
              uid: numericUid
            }),
          });
          if (!res.ok) {
            throw new Error('Failed to fetch Agora token.');
          }
          const data = await res.json();
          setToken(data.token);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'An unexpected error occurred');
        }
      };

      fetchToken();
    }
  }, [appointmentId, session, status, router]);

  if (!token || !appId || uid === null || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        {error ? (
          <p className="text-lg text-red-500">{error}</p>
        ) : (
          <p className="text-lg">Connecting to consultation...</p>
        )}
      </div>
    );
  }

  return (
    <VideoCall 
      // *** THIS IS THE CORRECTED LINE ***
      channelName={appointmentId} 
      appId={appId}
      token={token}
      uid={uid}
      onLeave={() => router.back()} // Go back to the previous page on leave
    />
  );
}