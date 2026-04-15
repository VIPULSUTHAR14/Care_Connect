"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"

type VideoCallDoctorProps = {
  socket: Socket
  callId: string
  patientId: string
  onEndCall: () => void
}

export default function VideoCallDoctor({ socket, callId, patientId, onEndCall }: VideoCallDoctorProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [ending, setEnding] = useState(false)

  const cleanup = useCallback(() => {
    try {
      // Emit call end once
      if (!ending) {
        socket.emit("call:end", { callId })
        setEnding(true)
      }
    } catch { }

    try {
      // Stop local media tracks
      localStreamRef.current?.getTracks().forEach((t) => {
        try { t.stop() } catch { }
      })
    } catch { }

    try {
      // Close peer connection
      pcRef.current?.getSenders().forEach((s) => {
        try { s.track && s.track.stop() } catch { }
      })
      pcRef.current?.close()
    } catch { }

    localStreamRef.current = null
    pcRef.current = null
  }, [callId, socket, ending])

  useEffect(() => {
    let mounted = true

    // 1) Create RTCPeerConnection with Google STUN
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] },
      ],
    })
    pcRef.current = pc

    // 2) Handle ICE candidates -> send to signaling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:candidate", {
          callId,
          targetId: patientId,
          candidate: event.candidate,
        })
      }
    }

    // 3) When remote track arrives, set to remote video
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    // 4) Get local media and attach
    const startLocalMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!mounted) return
        localStreamRef.current = localStream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to get local media:", err)
      }
    }

    // 5) Signaling listeners
    const handleOffer = async (payload: { callId: string; sdp: RTCSessionDescriptionInit }) => {
      if (payload.callId !== callId) return
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit("webrtc:answer", {
          callId,
          targetId: patientId,
          sdp: answer,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error handling offer:", err)
      }
    }

    const handleCandidate = async (payload: { callId: string; candidate: RTCIceCandidateInit }) => {
      if (payload.callId !== callId) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error adding ICE candidate:", err)
      }
    }

    socket.on("webrtc:offer", handleOffer)
    socket.on("webrtc:candidate", handleCandidate)

    // Start local media after handlers are ready
    startLocalMedia()

    return () => {
      mounted = false
      try { socket.off("webrtc:offer", handleOffer) } catch { }
      try { socket.off("webrtc:candidate", handleCandidate) } catch { }
      cleanup()
    }
  }, [callId, patientId, socket, cleanup])

  const endCall = () => {
    cleanup()
    onEndCall()
  }

  return (
    <div className="relative w-full h-[70vh] bg-black rounded-lg overflow-hidden">
      {/* Remote video takes full space */}
      <video
        ref={remoteVideoRef}
        id="remoteVideo"
        className="w-full h-full object-cover bg-black"
        autoPlay
        playsInline
      />

      {/* Local video as picture-in-picture */}
      <div className="absolute bottom-4 right-4 w-48 h-32 rounded-md overflow-hidden border border-white/20 shadow-lg">
        <video
          ref={localVideoRef}
          id="localVideo"
          className="w-full h-full object-cover bg-black"
          autoPlay
          muted
          playsInline
        />
      </div>

      {/* End Call Button */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={endCall}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          End Call
        </button>
      </div>
    </div>
  )
}


