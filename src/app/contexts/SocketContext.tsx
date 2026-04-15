'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinRoom: (userId: string, userType: 'hospital' | 'doctor' | 'patient') => void
  sendHospitalNotification: (data: {
    hospitalId: string
    message: string
    type: 'appointment' | 'emergency' | 'staff' | 'patient'
  }) => void
  sendDoctorNotification: (data: {
    doctorId: string
    message: string
    type: 'appointment' | 'emergency' | 'patient' | 'hospital'
  }) => void
  sendPatientNotification: (data: {
    patientId: string
    message: string
    type: 'appointment' | 'prescription' | 'test-result' | 'emergency'
  }) => void
  updateAppointmentStatus: (data: {
    hospitalId: string
    doctorId?: string
    appointmentId: string
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    patientName: string
    time: string
  }) => void
  sendEmergencyAlert: (data: {
    hospitalId: string
    patientId: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    location?: string
  }) => void
  updateStaffStatus: (data: {
    hospitalId: string
    staffId: string
    status: 'online' | 'offline' | 'busy' | 'available'
    role: 'doctor' | 'nurse' | 'admin' | 'receptionist'
  }) => void
  // Agora signaling helpers
  inviteCall: (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => void
  acceptCall: (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => void
  rejectCall: (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
    reason?: string
  }) => void
  endCall: (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => void
  notifications: Array<{
    id: string
    message: string
    type: string
    timestamp: string
  }>
  clearNotifications: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: string
    timestamp: string
  }>>([])

  useEffect(() => {
    // Connect to the socket server initialized by server.js
    const socketInstance = io({
      path: '/api/socket/',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      timeout: 20000,
      forceNew: true,
    })

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      setIsConnected(false)
    })

    // Notification event handlers
    socketInstance.on('notification', (data) => {
      const newNotification = {
        id: Date.now().toString(),
        message: data.message,
        type: data.type,
        timestamp: data.timestamp,
      }
      setNotifications(prev => [newNotification, ...prev])
    })

    socketInstance.on('appointment-status-change', (data) => {
      const newNotification = {
        id: Date.now().toString(),
        message: `Appointment ${data.appointmentId} status changed to ${data.status}`,
        type: 'appointment',
        timestamp: new Date().toISOString(),
      }
      setNotifications(prev => [newNotification, ...prev])
    })

    socketInstance.on('emergency-alert', (data) => {
      const newNotification = {
        id: Date.now().toString(),
        message: `EMERGENCY: ${data.message} (Severity: ${data.severity})`,
        type: 'emergency',
        timestamp: data.timestamp,
      }
      setNotifications(prev => [newNotification, ...prev])
    })

    socketInstance.on('staff-status-update', (data) => {
      const newNotification = {
        id: Date.now().toString(),
        message: `Staff member ${data.staffId} is now ${data.status}`,
        type: 'staff',
        timestamp: data.timestamp,
      }
      setNotifications(prev => [newNotification, ...prev])
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const joinRoom = (userId: string, userType: 'hospital' | 'doctor' | 'patient') => {
    if (socket) {
      socket.emit('join-room', { userId, userType })
    }
  }

  const sendHospitalNotification = (data: {
    hospitalId: string
    message: string
    type: 'appointment' | 'emergency' | 'staff' | 'patient'
  }) => {
    if (socket) {
      socket.emit('hospital-notification', data)
    }
  }

  const sendDoctorNotification = (data: {
    doctorId: string
    message: string
    type: 'appointment' | 'emergency' | 'patient' | 'hospital'
  }) => {
    if (socket) {
      socket.emit('doctor-notification', data)
    }
  }

  const sendPatientNotification = (data: {
    patientId: string
    message: string
    type: 'appointment' | 'prescription' | 'test-result' | 'emergency'
  }) => {
    if (socket) {
      socket.emit('patient-notification', data)
    }
  }

  const updateAppointmentStatus = (data: {
    hospitalId: string
    doctorId?: string
    appointmentId: string
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    patientName: string
    time: string
  }) => {
    if (socket) {
      socket.emit('appointment-update', data)
    }
  }

  const sendEmergencyAlert = (data: {
    hospitalId: string
    patientId: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    location?: string
  }) => {
    if (socket) {
      socket.emit('emergency-alert', data)
    }
  }

  const updateStaffStatus = (data: {
    hospitalId: string
    staffId: string
    status: 'online' | 'offline' | 'busy' | 'available'
    role: 'doctor' | 'nurse' | 'admin' | 'receptionist'
  }) => {
    if (socket) {
      socket.emit('staff-status', data)
    }
  }

  // Agora signaling emitters
  const inviteCall = (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => { if (socket) socket.emit('call:invite', data) }

  const acceptCall = (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => { if (socket) socket.emit('call:accept', data) }

  const rejectCall = (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
    reason?: string
  }) => { if (socket) socket.emit('call:reject', data) }

  const endCall = (data: {
    toUserType: 'hospital' | 'doctor' | 'patient'
    toUserId: string
    fromUserType: 'hospital' | 'doctor' | 'patient'
    fromUserId: string
    channelName: string
    appointmentId?: string
  }) => { if (socket) socket.emit('call:end', data) }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    sendHospitalNotification,
    sendDoctorNotification,
    sendPatientNotification,
    updateAppointmentStatus,
    sendEmergencyAlert,
    updateStaffStatus,
    inviteCall,
    acceptCall,
    rejectCall,
    endCall,
    notifications,
    clearNotifications,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}
