'use client'

import React, { useState } from 'react'
import { useSocketContext } from '@/app/contexts/SocketContext'
import { Bell, X, AlertTriangle, Calendar, User, Stethoscope } from 'lucide-react'

const NotificationCenter: React.FC = () => {
  const { notifications, clearNotifications, isConnected } = useSocketContext()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'staff':
        return <User className="w-5 h-5 text-green-500" />
      case 'patient':
        return <Stethoscope className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-200'
      case 'appointment':
        return 'bg-blue-50 border-blue-200'
      case 'staff':
        return 'bg-green-50 border-green-200'
      case 'patient':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-3 h-3">
            !
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification: { id: string; message: string; type: string; timestamp: string }) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
