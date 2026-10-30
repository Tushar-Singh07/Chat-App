export const getIceServers = (): RTCConfiguration => {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
    // Public OpenRelay TURN servers for reliable P2P NAT & mobile data bypass
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  const turnUrl = import.meta.env.VITE_TURN_SERVER_URL;
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;

  async getMediaStream(isVideo: boolean): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
              frameRate: { ideal: 30 },
            }
          : false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream = stream;
        return stream;
      } catch (firstErr: any) {
        console.warn('[WebRTC] Ideal constraints failed, falling back to basic media constraints:', firstErr?.message);
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo ? true : false,
        });
        this.localStream = fallbackStream;
        return fallbackStream;
      }
    } catch (err: any) {
      console.error('[WebRTC] Error acquiring media stream:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone/Camera permission was denied. Please allow device permissions in your browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('Microphone or Camera device not found on your system.');
      }
      throw new Error(err.message || 'Failed to access microphone or camera.');
    }
  }

  createPeerConnection(
    onRemoteStream: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): RTCPeerConnection {
    this.onRemoteStreamCallback = onRemoteStream;
    this.onIceCandidateCallback = onIceCandidate;
    this.remoteStream = new MediaStream();

    const config = getIceServers();
    const pc = new RTCPeerConnection(config);
    this.peerConnection = pc;

    // Send candidate to peer via signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        const c = event.candidate;
        const candidatePayload = c.toJSON ? c.toJSON() : {
          candidate: c.candidate,
          sdpMid: c.sdpMid,
          sdpMLineIndex: c.sdpMLineIndex,
          usernameFragment: c.usernameFragment,
        };
        this.onIceCandidateCallback(candidatePayload as RTCIceCandidate);
      }
    };

    // Track handler for remote streams
    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack received:', event.track.kind, event.track.id);

      // Add track to persistent remote stream accumulator
      if (!this.remoteStream.getTracks().some((t) => t.id === event.track.id)) {
        this.remoteStream.addTrack(event.track);
      }

      // Also harvest any tracks from event.streams if available
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!this.remoteStream.getTracks().some((t) => t.id === track.id)) {
            this.remoteStream.addTrack(track);
          }
        });
      }

      // Track packets arriving (unmute)
      event.track.onunmute = () => {
        console.log('[WebRTC] Track unmuted and receiving packets:', event.track.kind);
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(new MediaStream(this.remoteStream.getTracks()));
        }
      };

      // Dispatch callback with a fresh MediaStream instance so React state detects reference change
      if (this.onRemoteStreamCallback) {
        const cloned = new MediaStream(this.remoteStream.getTracks());
        this.onRemoteStreamCallback(cloned);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection state:', pc.iceConnectionState);
    };

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Ensure audio & video transceivers are set to send and receive
    if (!pc.getTransceivers().some((t) => t.receiver.track.kind === 'audio')) {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
    }
    if (!pc.getTransceivers().some((t) => t.receiver.track.kind === 'video')) {
      pc.addTransceiver('video', { direction: 'sendrecv' });
    }

    return pc;
  }

  // Helper to wait briefly for local ICE candidates to gather into SDP (hybrid Trickle + Vanilla)
  private waitForIceGathering(timeoutMs = 400): Promise<void> {
    if (!this.peerConnection) return Promise.resolve();
    if (this.peerConnection.iceGatheringState === 'complete') {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout>;
      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          clearTimeout(timer);
          this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };
      this.peerConnection?.addEventListener('icegatheringstatechange', checkState);
      timer = setTimeout(() => {
        this.peerConnection?.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, timeoutMs);
    });
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peerConnection.setLocalDescription(offer);
    await this.waitForIceGathering(400);
    return this.peerConnection.localDescription || offer;
  }

  async handleOfferAndCreateAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    await this.processPendingCandidates();

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.waitForIceGathering(400);
    return this.peerConnection.localDescription || answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    await this.processPendingCandidates();
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!candidate || !candidate.candidate) return;

    if (!this.peerConnection || !this.peerConnection.remoteDescription || !this.peerConnection.remoteDescription.type) {
      console.log('[WebRTC] Queuing ICE candidate (remote description not ready yet):', candidate.candidate.substring(0, 30));
      this.pendingIceCandidates.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err: any) {
      console.warn('[WebRTC] Error adding ICE candidate:', err.message);
    }
  }

  async processPendingCandidates(): Promise<void> {
    if (!this.peerConnection || this.pendingIceCandidates.length === 0) return;
    console.log(`[WebRTC] Applying ${this.pendingIceCandidates.length} queued ICE candidates`);
    const queued = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];
    for (const cand of queued) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err: any) {
        console.warn('[WebRTC] Failed to add queued candidate:', err.message);
      }
    }
  }

  hasPeerConnection(): boolean {
    return !!this.peerConnection;
  }

  toggleAudio(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  close(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = new MediaStream();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.pendingIceCandidates = [];
    this.onRemoteStreamCallback = null;
    this.onIceCandidateCallback = null;
  }
}
