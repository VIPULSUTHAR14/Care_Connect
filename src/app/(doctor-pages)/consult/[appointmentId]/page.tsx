// src/app/(doctor-pages)/consult/[appointmentId]/page.tsx
// Placeholder page — full implementation is commented out below.

export default function ConsultationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700">
      Consultation page coming soon.
    </div>
  );
}

// Full implementation (uncomment when ready):
// 'use client';
// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { Loader2 } from 'lucide-react';
// import VideoCall from '@/components/hospital-components/VideoCallDoctor';
//
// export default function ConsultationPage() {
//   const params = useParams();
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const appointmentId = params.appointmentId as string;
//   const [token, setToken] = useState<string | null>(null);
//   const [uid, setUid] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
//   useEffect(() => {
//     if (status === 'unauthenticated') { router.replace('/signin'); return; }
//     if (status === 'authenticated' && appointmentId && session?.user?.id) {
//       const storageKey = `agora:${appointmentId}:uid`;
//       let numericUid: number;
//       const persisted = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
//       if (persisted) { numericUid = parseInt(persisted, 10); }
//       else { numericUid = Math.floor(100000 + Math.random() * 900000); try { window.sessionStorage.setItem(storageKey, String(numericUid)); } catch {} }
//       setUid(numericUid);
//       (async () => {
//         try {
//           const res = await fetch('/api/agora/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelName: appointmentId, uid: numericUid }) });
//           if (!res.ok) throw new Error('Failed to fetch Agora token.');
//           const data = await res.json();
//           setToken(data.token);
//         } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); }
//       })();
//     }
//   }, [appointmentId, session, status, router]);
//   if (!token || !appId || uid === null || status === 'loading') {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
//         <Loader2 className="w-12 h-12 animate-spin mb-4" />
//         {error ? <p className="text-lg text-red-500">{error}</p> : <p className="text-lg">Connecting to consultation...</p>}
//       </div>
//     );
//   }
// }