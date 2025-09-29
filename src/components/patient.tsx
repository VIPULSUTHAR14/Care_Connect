"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DoctorList from "@/components/DoctorList";
import VideoCall from "@/components/VideoCall";
import { connectSocket, ClientSocket } from "@/lib/socket";
import { v4 as uuidv4 } from "uuid";

interface DoctorItem {
	id: string;
	name: string;
	specialty: string;
}

interface ActiveCallState {
	status: "idle" | "requesting" | "in_call";
	callId: string | null;
	doctorId: string | null;
}

export default function PatientDashboardPage() {
	const patientId = "patient-123"; // fake id
	const token = "fake-patient-jwt-token"; // fake token for now

	const [socket, setSocket] = useState<ClientSocket | null>(null);
	const [doctors] = useState<DoctorItem[]>([
		{ id: "doc-1", name: "Dr. Alice Smith", specialty: "Cardiology" },
		{ id: "doc-2", name: "Dr. Bob Johnson", specialty: "Dermatology" },
		{ id: "doc-3", name: "Dr. Carol Lee", specialty: "Pediatrics" },
	]);
	const [activeCall, setActiveCall] = useState<ActiveCallState>({ status: "idle", callId: null, doctorId: null });

	// Connect socket on mount
	useEffect(() => {
		const s = connectSocket(token);
		setSocket(s);

		return () => {
			s.disconnect();
		};
	}, [token]);

	// Handle signaling events
	useEffect(() => {
		if (!socket) return;

		const onAccepted = ({ callId, callerId }: { callId: string; callerId: string }) => {
			setActiveCall((prev) => {
				if (prev.callId !== callId) return prev;
				return { ...prev, status: "in_call" };
			});
		};

		const onRejected = ({ callId }: { callId: string }) => {
			setActiveCall((prev) => {
				if (prev.callId !== callId) return prev;
				alert("Doctor rejected");
				return { status: "idle", callId: null, doctorId: null };
			});
		};

		socket.on("call:accepted", onAccepted);
		socket.on("call:rejected", onRejected);

		return () => {
			socket.off("call:accepted", onAccepted);
			socket.off("call:rejected", onRejected);
		};
	}, [socket]);

	const handleCallDoctor = useCallback((doctorId: string) => {
		if (!socket) return;
		const callId = uuidv4();
		setActiveCall({ status: "requesting", callId, doctorId });
		socket.emit("call:request", { callId, callerId: patientId, calleeId: doctorId });
	}, [patientId, socket]);

	const handleEndCall = useCallback(() => {
		setActiveCall({ status: "idle", callId: null, doctorId: null });
	}, []);

	const activeDoctor = useMemo(() => doctors.find((d) => d.id === activeCall.doctorId) || null, [doctors, activeCall.doctorId]);

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<section className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold mb-4">Doctors</h2>
					<DoctorList onCall={handleCallDoctor} />
				</section>

			</div>
		</div>
	);
}
