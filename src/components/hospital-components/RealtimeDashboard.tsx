'use client'

import React, { useState, useEffect } from 'react'
import { useSocketContext } from '@/app/contexts/SocketContext'
import { useSession } from 'next-auth/react'
import { 
  Activity, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

interface DashboardStats {
  totalAppointments: number
  activeAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  onlineStaff: number
  totalStaff: number
  emergencyAlerts: number
}

const RealtimeDashboard: React.FC = () => {
  const { 
    socket, 
    isConnected, 
    joinRoom, 
    updateAppointmentStatus,
    sendEmergencyAlert,
    updateStaffStatus,
    notifications 
  } = useSocketContext()
  const { data: session } = useSession()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    activeAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    onlineStaff: 0,
    totalStaff: 0,
    emergencyAlerts: 0,
  })

  const [testData, setTestData] = useState({
    hospitalId: 'hospital-001',
    doctorId: 'doctor-001',
    appointmentId: 'apt-001',
    patientName: 'John Doe',
    time: '10:00 AM',
  })

  // Join room when user is authenticated
  useEffect(() => {
    if (session?.user && isConnected) {
      const userType = session.user.userType || 'hospital'
      const userId = session.user.id || 'user-001'
      joinRoom(userId, userType as 'hospital' | 'doctor' | 'patient')
    }
  }, [session, isConnected, joinRoom])

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('appointment-status-change', (data: { status: string; appointmentId: string }) => {
        setStats(prev => ({
          ...prev,
          activeAppointments: data.status === 'in-progress' ? prev.activeAppointments + 1 : prev.activeAppointments,
          completedAppointments: data.status === 'completed' ? prev.completedAppointments + 1 : prev.completedAppointments,
          cancelledAppointments: data.status === 'cancelled' ? prev.cancelledAppointments + 1 : prev.cancelledAppointments,
        }))
      })

      socket.on('emergency-alert', () => {
        setStats(prev => ({
          ...prev,
          emergencyAlerts: prev.emergencyAlerts + 1,
        }))
      })

      socket.on('staff-status-update', (data: { status: string; staffId: string }) => {
        setStats(prev => ({
          ...prev,
          onlineStaff: data.status === 'online' ? prev.onlineStaff + 1 : prev.onlineStaff - 1,
        }))
      })

      return () => {
        socket.off('appointment-status-change')
        socket.off('emergency-alert')
        socket.off('staff-status-update')
      }
    }
  }, [socket])

  const handleAppointmentUpdate = (status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') => {
    updateAppointmentStatus({
      ...testData,
      status,
    })
  }

  const handleEmergencyAlert = () => {
    sendEmergencyAlert({
      hospitalId: testData.hospitalId,
      patientId: 'patient-001',
      severity: 'high',
      message: 'Patient requires immediate attention',
      location: 'Emergency Room',
    })
  }

  const handleStaffStatusUpdate = (status: 'online' | 'offline' | 'busy' | 'available') => {
    updateStaffStatus({
      hospitalId: testData.hospitalId,
      staffId: testData.doctorId,
      status,
      role: 'doctor',
    })
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-time Dashboard</h1>
              <p className="text-gray-600 mt-2">Live updates for hospital operations</p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelledAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Staff Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Online Staff</span>
                <span className="font-semibold text-green-600">{stats.onlineStaff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Staff</span>
                <span className="font-semibold text-gray-900">{stats.totalStaff}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Emergency Alerts</h3>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.emergencyAlerts}</p>
              <p className="text-sm text-gray-600 mt-1">Active Alerts</p>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Real-time Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleAppointmentUpdate('in-progress')}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Start Appointment
            </button>
            <button
              onClick={() => handleAppointmentUpdate('completed')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Complete Appointment
            </button>
            <button
              onClick={() => handleAppointmentUpdate('cancelled')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel Appointment
            </button>
            <button
              onClick={handleEmergencyAlert}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Send Emergency Alert
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleStaffStatusUpdate('online')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Staff Online
            </button>
            <button
              onClick={() => handleStaffStatusUpdate('offline')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Staff Offline
            </button>
            <button
              onClick={() => handleStaffStatusUpdate('busy')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Staff Busy
            </button>
            <button
              onClick={() => handleStaffStatusUpdate('available')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Staff Available
            </button>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification: { id: string; message: string; timestamp: string }) => (
                <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RealtimeDashboard
