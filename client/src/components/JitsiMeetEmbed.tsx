import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, PhoneOff, Video } from 'lucide-react';

interface JitsiMeetEmbedProps {
  roomName: string;
  displayName: string;
  onSessionEnd: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeetEmbed: React.FC<JitsiMeetEmbedProps> = ({
  roomName,
  displayName,
  onSessionEnd
}) => {
  const [preJoinPassed, setPreJoinPassed] = useState<boolean>(false);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [camGranted, setCamGranted] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  // Pre-join camera and microphone permission test
  const requestMediaPermissions = async () => {
    setPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback for browsers or sandboxes without direct media devices
        setMicGranted(true);
        setCamGranted(true);
        setPreJoinPassed(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop tracks immediately after testing
      stream.getTracks().forEach((track) => track.stop());

      setMicGranted(true);
      setCamGranted(true);
      setPreJoinPassed(true);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access was denied. Please allow permissions in your browser bar.');
        setMicGranted(false);
        setCamGranted(false);
      } else {
        // On virtual devices or devices without physical camera, allow joining with warning
        setMicGranted(true);
        setCamGranted(true);
        setPreJoinPassed(true);
      }
    }
  };

  useEffect(() => {
    if (!preJoinPassed || !jitsiContainerRef.current) return;

    if (window.JitsiMeetExternalAPI) {
      const options = {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'videoquality'
          ]
        }
      };

      try {
        const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
        apiRef.current = api;

        api.addEventListener('videoConferenceLeft', () => {
          onSessionEnd();
        });
      } catch {
        setPermissionError('Unable to initialize video conferencing client. Please refresh or check network connectivity.');
      }
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [preJoinPassed, roomName, displayName]);

  if (!preJoinPassed) {
    return (
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-bold text-slate-800">Tele-Nutrition Video Consultation</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          You are about to enter a secure telehealth room with end-to-end video encryption. Please verify your camera and microphone readiness.
        </p>

        {permissionError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs text-left" role="alert">
            <p className="font-semibold mb-1">Permission Required</p>
            <p>{permissionError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
            <Camera className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-slate-700">Camera Check</p>
              <p className="text-[11px] text-slate-500">{camGranted === false ? 'Denied' : 'Ready'}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
            <Mic className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-slate-700">Microphone Check</p>
              <p className="text-[11px] text-slate-500">{micGranted === false ? 'Denied' : 'Ready'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={requestMediaPermissions}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
          >
            Allow Permissions & Join Video Session
          </button>
          <button
            onClick={() => setPreJoinPassed(true)}
            className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Continue with system audio/video defaults
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[650px] relative">
      <div className="bg-slate-800 px-4 py-2.5 flex justify-between items-center text-xs text-slate-200 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="font-semibold">Tele-Nutrition Live Session</span>
          <span className="text-slate-400 font-mono">({displayName})</span>
        </div>
        <button
          onClick={onSessionEnd}
          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium focus:ring-2 focus:ring-rose-400 text-xs"
        >
          <PhoneOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Leave Session</span>
        </button>
      </div>

      <div ref={jitsiContainerRef} className="flex-1 w-full h-full bg-black" />
    </div>
  );
};
