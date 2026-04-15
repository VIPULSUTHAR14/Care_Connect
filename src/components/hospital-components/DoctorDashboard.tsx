"use client"

import React, { useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import { connectDoctorSocket, disconnectDoctorSocket } from "../lib/doctorSocket"
import VideoCallDoctor from "./VideoCallDoctor"

type IncomingCall = {
  callId: string
  callerId: string
  calleeId: string
}

type DoctorDashboardProps = {
  doctorId: string
  authToken: string
}

export default function DoctorDashboard({ doctorId, authToken }: DoctorDashboardProps) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [inCall, setInCall] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect socket specifically for this doctor
    const socket = connectDoctorSocket(doctorId, authToken)
    socketRef.current = socket

    const handleIncoming = (payload: IncomingCall) => {
      if (payload?.calleeId === doctorId) {
        setIncomingCall(payload)
      }
    }

    socket.on("call:incoming", handleIncoming)

    return () => {
      try {
        socket.off("call:incoming", handleIncoming)
      } catch {}
      disconnectDoctorSocket()
      socketRef.current = null
    }
  }, [doctorId, authToken])

  const acceptCall = () => {
    const current = incomingCall
    if (!current || !socketRef.current) return
    socketRef.current.emit("call:accept", { callId: current.callId, doctorId })
    // Move to in-call UI (WebRTC flow handled by VideoCallDoctor)
    setInCall(true)
  }

  const rejectCall = () => {
    const current = incomingCall
    if (!current || !socketRef.current) return
    socketRef.current.emit("call:reject", { callId: current.callId, doctorId })
    setIncomingCall(null)
  }

  return (
    <div className="w-full">
      {inCall && incomingCall && socketRef.current ? (
        <VideoCallDoctor
          socket={socketRef.current}
          callId={incomingCall.callId}
          patientId={incomingCall.callerId}
          onEndCall={() => {
            setInCall(false)
            setIncomingCall(null)
          }}
        />
      ) : incomingCall ? (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-yellow-900 font-semibold">Incoming Call</h3>
              <p className="text-yellow-800 mt-1 text-sm">
                Patient ID: <span className="font-mono">{incomingCall.callerId}</span>
              </p>
              <p className="text-yellow-800 mt-1 text-xs">
                Call ID: <span className="font-mono">{incomingCall.callId}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={acceptCall}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={rejectCall}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-gray-600">
          No incoming calls
        </div>
      )}
    </div>
  )
}


