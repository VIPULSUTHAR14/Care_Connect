// src/app/components/VideoCall.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack, 
  IAgoraRTCRemoteUser 
} from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  onLeave: () => void; // Callback to close the call UI
}

// 1. FIX: Create a more specific type for the client to safely access connectionState
type AgoraClientWithState = IAgoraRTCClient & { connectionState?: string };

const VideoCall: React.FC<VideoCallProps> = ({ channelName, appId, token, uid, onLeave }) => {
  const [client] = useState<IAgoraRTCClient>(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | []>([]);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const startedRef = useRef(false);
  const joinedRef = useRef(false);
  const joiningRef = useRef(false);
  const publishedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    mountedRef.current = true;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      try {
        await client.subscribe(user, mediaType);
        setRemoteUsers(Array.from(client.remoteUsers));

        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          if (remoteVideoTrack) {
            setTimeout(() => remoteVideoTrack.play(`remote-video-player-${user.uid}`), 0);
          }
        }
      } catch (err) {
        console.error('Subscribe error:', err);
      }
    };

    const handleUserLeft = () => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const joinChannel = async () => {
      try {
        if (!mountedRef.current) return;

        // 2. FIX: Use the specific type for the cast, removing the need for 'any' and '@ts-ignore'
        const state = (client as AgoraClientWithState).connectionState;
        if (state && state !== 'DISCONNECTED') {
          // already connecting/connected; skip join
        } else if (!joinedRef.current && !joiningRef.current) {
          joiningRef.current = true;
          await client.join(appId, channelName, token, uid);
          joinedRef.current = true;
          joiningRef.current = false;
        }

        if (localTracks.length === 0) {
          const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          if (!mountedRef.current) {
            tracks.forEach(t => { try { t.stop(); t.close(); } catch {} });
            return;
          }
          setLocalTracks(tracks);
          tracks[1].play('local-video-player');
          
          if (!publishedRef.current) {
            try {
              await client.publish(tracks);
              publishedRef.current = true;
            } catch (err: unknown) { // 3. FIX: Use 'unknown' for type safety
              if (err instanceof Error) {
                if (err.message.includes('CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS')) {
                  // Ignore harmless error from dev StrictMode
                } else {
                  throw err;
                }
              } else {
                 throw err;
              }
            }
          }
        }

        client.off('user-published', handleUserPublished);
        client.off('user-left', handleUserLeft);
        client.on('user-published', handleUserPublished);
        client.on('user-left', handleUserLeft);
      } catch (error: unknown) { // 3. FIX: Use 'unknown'
        console.error('Failed to join/publish', error);
        joiningRef.current = false;
      }
    };

    void joinChannel();

    return () => {
      mountedRef.current = false;
      try {
        if (publishedRef.current && localTracks.length > 0) {
          // 4. FIX: Remove unnecessary 'as any' cast
          client.unpublish(localTracks).catch(() => {});
        }
      } catch {}
      try {
        for (const track of localTracks) {
          try { track.stop(); } catch {}
          try { track.close(); } catch {}
        }
      } catch {}
      try {
        client.off('user-published', handleUserPublished);
        client.off('user-left', handleUserLeft);
      } catch {}
      try {
        if (joinedRef.current) {
          client.leave().catch(() => {});
        }
      } catch {}
      startedRef.current = false;
      joinedRef.current = false;
      joiningRef.current = false;
      publishedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, channelName, token, uid, client]);

  const handleToggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const handleToggleCamera = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  return (
    // ... JSX remains the same
    <div className="w-full h-full bg-black flex flex-col p-4 relative">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Player */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500">
                <div id="local-video-player" className="w-full h-full"></div>
                <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm font-semibold">
                    You (Doctor)
                </p>
            </div>
            {/* Remote Players */}
            {remoteUsers.map(user => (
                <div key={user.uid} className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <div id={`remote-video-player-${user.uid}`} className="w-full h-full"></div>
                    <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm font-semibold">
                        Patient
                    </p>
                </div>
            ))}
        </div>
        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-gray-800 bg-opacity-70 rounded-full">
            <button onClick={handleToggleMic} className={`p-3 rounded-full transition-colors ${micOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {micOn ? <Mic className="text-white" /> : <MicOff className="text-white" />}
            </button>
            <button onClick={handleToggleCamera} className={`p-3 rounded-full transition-colors ${cameraOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {cameraOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
            </button>
            <button onClick={onLeave} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors">
                <PhoneOff className="text-white" />
            </button>
        </div>
    </div>
  );
};

export default VideoCall;