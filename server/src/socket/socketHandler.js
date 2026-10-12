import User from '../models/User.js';
import Call from '../models/Call.js';
import { verifyToken } from '../utils/jwt.js';

export const setupSocketIO = (io) => {
  // Map of userId -> Set of socketIds
  const userSockets = new Map();
  // Map of socketId -> userId
  const socketUserMap = new Map();
  // Map of callId -> active call info
  const activeCalls = new Map();

  // Socket Authentication Middleware using JWT
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.userId = decoded.id.toString();
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      return next(new Error('Authentication error: ' + err.message));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`[Socket.io] Authenticated user connected: ${userId} (socket ${socket.id})`);

    // Join personal user room for targeted signaling (works across multi-tabs)
    socket.join(`user:${userId}`);

    // Track user socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    const userSet = userSockets.get(userId);
    const isFirstConnection = userSet.size === 0;
    userSet.add(socket.id);
    socketUserMap.set(socket.id, userId);

    // Set online in DB and broadcast presence if first connection
    if (isFirstConnection) {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      } catch (err) {
        console.error('Failed to set user online in DB:', err);
      }
      io.emit('user_presence_change', { userId, isOnline: true, lastSeen: 'Online' });
    }

    // Join / Leave conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) socket.leave(conversationId);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', { conversationId, userId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stop_typing', { conversationId, userId });
    });

    // Real-Time Messages
    socket.on('send_message', (message) => {
      if (message && message.conversationId) {
        socket.to(message.conversationId).emit('receive_message', message);
      }
    });

    // ==========================================
    // WebRTC Signaling Events
    // ==========================================

    // 1. Caller initiates a call
    socket.on('call:initiate', ({ callId, receiverId, type, offer, caller }) => {
      console.log(`[CALL] ${userId} initiating ${type} call (${callId}) to ${receiverId}`);

      // Check if receiver is online
      const receiverSet = userSockets.get(receiverId);
      if (!receiverSet || receiverSet.size === 0) {
        console.log(`[CALL] Receiver ${receiverId} is offline`);
        socket.emit('call:unavailable', { callId, reason: 'User is offline' });
        return;
      }

      // Check if receiver is currently in another call
      let isReceiverBusy = false;
      for (const [, callInfo] of activeCalls) {
        if (
          (callInfo.callerId === receiverId || callInfo.receiverId === receiverId) &&
          callInfo.status !== 'ended'
        ) {
          isReceiverBusy = true;
          break;
        }
      }

      if (isReceiverBusy) {
        console.log(`[CALL] Receiver ${receiverId} is busy`);
        socket.emit('call:busy', { callId });
        return;
      }

      // Save active call session
      activeCalls.set(callId, {
        callId,
        callerId: userId,
        receiverId,
        type,
        offer,
        status: 'calling',
        startTime: Date.now(),
      });

      // Forward incoming call to receiver's user room
      io.to(`user:${receiverId}`).emit('call:incoming', {
        callId,
        callerId: userId,
        receiverId,
        caller: caller || { id: userId },
        type,
        offer,
      });

      // Notify caller that call is ringing
      socket.emit('call:ringing', { callId });
    });

    // 2. Receiver accepts call
    socket.on('call:accept', ({ callId, answer }) => {
      console.log(`[CALL] ${userId} accepted call ${callId}`);
      const call = activeCalls.get(callId);
      if (call) {
        call.status = 'connected';
        // Notify caller
        io.to(`user:${call.callerId}`).emit('call:accepted', { callId, answer });
      }
    });

    // 3. ICE Candidate exchange
    socket.on('call:ice-candidate', ({ callId, to, candidate }) => {
      const targetId = to;
      if (targetId) {
        io.to(`user:${targetId}`).emit('call:ice-candidate', { callId, candidate, from: userId });
      }
    });

    // 4. Receiver rejects call
    socket.on('call:reject', ({ callId, to }) => {
      console.log(`[CALL] ${userId} rejected call ${callId}`);
      const call = activeCalls.get(callId);
      const targetId = to || (call ? call.callerId : null);
      if (targetId) {
        io.to(`user:${targetId}`).emit('call:rejected', { callId });
      }
      if (call) {
        call.status = 'rejected';
        activeCalls.delete(callId);
      }
    });

    // 5. Caller cancels call
    socket.on('call:cancel', ({ callId, to }) => {
      console.log(`[CALL] ${userId} cancelled call ${callId}`);
      const call = activeCalls.get(callId);
      const targetId = to || (call ? call.receiverId : null);
      if (targetId) {
        io.to(`user:${targetId}`).emit('call:cancelled', { callId });
      }
      if (call) {
        call.status = 'cancelled';
        activeCalls.delete(callId);
      }
    });

    // 6. Either user ends active call
    socket.on('call:end', ({ callId, to }) => {
      console.log(`[CALL] ${userId} ended call ${callId}`);
      const call = activeCalls.get(callId);
      const targetId = to || (call ? (call.callerId === userId ? call.receiverId : call.callerId) : null);
      if (targetId) {
        io.to(`user:${targetId}`).emit('call:ended', { callId });
      }
      if (call) {
        call.status = 'ended';
        activeCalls.delete(callId);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          } catch (err) {
            console.error('Failed to set user offline in DB:', err);
          }
          io.emit('user_presence_change', {
            userId,
            isOnline: false,
            lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }
      socketUserMap.delete(socket.id);

      // Check if user was in active calls and notify peer
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerId === userId || call.receiverId === userId) {
          const peerId = call.callerId === userId ? call.receiverId : call.callerId;
          io.to(`user:${peerId}`).emit('call:ended', { callId, reason: 'Peer disconnected' });
          activeCalls.delete(callId);
        }
      }

      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

