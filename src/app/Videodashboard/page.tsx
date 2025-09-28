'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Video, Calendar, AlertCircle, CheckCircle2, Hospital, Phone, X } from 'lucide-react';
import React from 'react';
import { useSocket } from '@/hooks/useSocket';

interface Appointment {
  _id: string;
  hospitalId: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: string;
}

interface IncomingCallPayload {
  callId: string;
  callerId: string;
  calleeId: string;
}

// Reusable StatusBadge component (no changes needed)
const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const statusStyles = {
    approved: { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, text: 'Approved', className: 'bg-green-100 text-green-800' },
    completed: { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, text: 'Completed', className: 'bg-blue-100 text-blue-800' },
    cancelled: { icon: <AlertCircle className="w-4 h-4 mr-1.5" />, text: 'Cancelled', className: 'bg-red-100 text-red-800' },
    pending: { icon: <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />, text: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800' },
  } as const;
  const style = statusStyles[status] || statusStyles.pending;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style.className}`}>{style.icon}{style.text}</span>;
};

// Incoming Call Modal Component
const IncomingCallModal = ({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
    <div className="bg-white rounded-lg shadow-xl p-8 text-center animate-pulse">
      <h3 className="text-xl font-medium text-gray-900">Incoming Call</h3>
      <p className="mt-2 text-md text-gray-500">Your doctor is ready to see you now.</p>
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={onReject}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <X className="w-5 h-5 mr-2" />
          Reject
        </button>
        <button
          onClick={onAccept}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Phone className="w-5 h-5 mr-2" />
          Accept
        </button>
      </div>
    </div>
  </div>
);

export default function PatientDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const userId = useMemo(() => (session?.user as any)?.id as string | undefined, [session?.user]);
  const { socket } = useSocket(userId || '');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/signin');
    }
    if (sessionStatus === 'authenticated') {
      const fetchAppointments = async () => {
        try {
          const res = await fetch('/api/appointments');
          if (!res.ok) throw new Error('Failed to fetch your appointments.');
          const data = await res.json();
          setAppointments(data.appointments);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [sessionStatus, router]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const onIncoming = (data: IncomingCallPayload) => {
      setIncomingCall(data);
    };

    socket.on('call:incoming', onIncoming);
    return () => {
      socket.off('call:incoming', onIncoming);
    };
  }, [socket]);

  const handleAcceptCall = () => {
    if (!socket || !incomingCall) return;
    const { callId, callerId, calleeId } = incomingCall;
    socket.emit('call:accept', { callId, callerId, calleeId });
    router.push(`/consult/${callId}`);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!socket || !incomingCall) return;
    const { callId, callerId } = incomingCall;
    socket.emit('call:reject', { callId, callerId });
    setIncomingCall(null);
  };

  if (sessionStatus === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {incomingCall && (
        <IncomingCallModal 
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Appointments 🤒</h1>
          <p className="mt-2 text-lg text-gray-600">View your upcoming and past consultations.</p>
        </header>

        {appointments.length === 0 ? (
          <div className="text-center py-16"><h3 className="text-lg font-medium text-gray-900">No Appointments Found</h3></div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center mb-2">
                    <Hospital className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-sm font-medium text-gray-500">
                      Appointment ID: <span className="text-gray-800 font-semibold">{appt._id}</span>
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <p>Booked on: {new Date(appt.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <StatusBadge status={appt.status} />
                  {appt.status === 'approved' && (
                    <button
                      onClick={() => router.push(`/consult/${appt._id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Join Consult
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}