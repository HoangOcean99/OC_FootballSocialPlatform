'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to the API Gateway WS
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      // Register user id
      socketInstance.emit('register', { userId: user.id });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Request Notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const showNotification = (title: string, options?: NotificationOptions) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico', // Update with actual icon path if available
          ...options,
        });
      }
    };

    // Global Event Listeners for Notifications
    socketInstance.on('COMMUNITY_JOIN_REQUESTED', (data) => {
      showNotification('Yêu cầu tham gia mới', {
        body: `${data.username} muốn tham gia cộng đồng ${data.communityName} của bạn.`,
        icon: data.avatarUrl || '/favicon.ico'
      });
    });

    socketInstance.on('COMMUNITY_REQUEST_APPROVED', (data) => {
      showNotification('Đã được duyệt', {
        body: `Bạn đã được duyệt vào cộng đồng ${data.communityName}!`,
      });
    });

    socketInstance.on('COMMUNITY_INVITE_ACCEPTED', (data) => {
      showNotification('Đồng ý lời mời', {
        body: `${data.username} đã chấp nhận lời mời tham gia cộng đồng ${data.communityName}.`,
        icon: data.avatarUrl || '/favicon.ico'
      });
    });

    socketInstance.on('COMMUNITY_INVITE_RECEIVED', (data) => {
      showNotification('Lời mời mới', {
        body: `Bạn nhận được lời mời tham gia cộng đồng ${data.communityName}!`,
      });
    });

    socketInstance.on('COMMUNITY_ADMIN_INVITE_RECEIVED', (data) => {
      showNotification('Lời mời Quản trị viên', {
        body: `Bạn được mời làm Quản trị viên cộng đồng ${data.communityName}!`,
      });
      // Force update user store to show banner
      const currentInvites = useAuthStore.getState().user?.adminInvites || [];
      if (!currentInvites.includes(data.communityId)) {
        useAuthStore.getState().updateUser({ adminInvites: [...currentInvites, data.communityId] });
      }
    });

    socketInstance.on('COMMUNITY_ADMIN_INVITE_ACCEPTED', (data) => {
      showNotification('Quản trị viên mới', {
        body: `${data.username} đã chấp nhận làm Quản trị viên cộng đồng.`,
        icon: data.avatarUrl || '/favicon.ico'
      });
    });

    socketInstance.on('newPrivateMessage', (data) => {
      showNotification('Tin nhắn mới', {
        body: data.content,
      });
    });

    socketInstance.on('NEW_NOTIFICATION', (data) => {
      useNotificationStore.getState().addNotification(data);
      showNotification('Thông báo mới', {
        body: data.content,
        icon: data.sender?.avatarUrl || '/favicon.ico'
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('COMMUNITY_JOIN_REQUESTED');
      socketInstance.off('COMMUNITY_REQUEST_APPROVED');
      socketInstance.off('COMMUNITY_INVITE_ACCEPTED');
      socketInstance.off('COMMUNITY_INVITE_RECEIVED');
      socketInstance.off('COMMUNITY_ADMIN_INVITE_RECEIVED');
      socketInstance.off('COMMUNITY_ADMIN_INVITE_ACCEPTED');
      socketInstance.off('newPrivateMessage');
      socketInstance.off('NEW_NOTIFICATION');
      socketInstance.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
