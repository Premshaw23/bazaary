"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../auth/context';
import { toast } from 'sonner';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user) {
            // We use httpOnly cookies, so we don't need to manually send the token.
            // Just ensure withCredentials is true so cookies are sent.
            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Prioritize websocket
            });

            socketInstance.on('connect', () => {
                setIsConnected(true);
                console.log('Connected to WebSocket');
            });

            socketInstance.on('notification', (data: { title: string; message: string; type: string }) => {
                if (data.type === 'success') {
                    toast.success(data.title, { description: data.message });
                } else {
                    toast(data.title, { description: data.message });
                }
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
