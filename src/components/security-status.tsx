// Security Status Component - Real-time Security Monitoring
'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { getSecurityBadgeColor } from '@/lib/utils'

interface SecurityStatusProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  fraudScore: number
  userEmail: string
}

export function SecurityStatus({ level, fraudScore, userEmail }: SecurityStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastCheck, setLastCheck] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date())
      setIsOnline(navigator.onLine)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getSecurityIcon = () => {
    switch (level) {
      case 'LOW':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'MEDIUM':
        return <Shield className="w-4 h-4 text-yellow-400" />
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-400 animate-pulse" />
      default:
        return <Shield className="w-4 h-4 text-purple-400" />
    }
  }

  const getSecurityDescription = () => {
    switch (level) {
      case 'LOW':
        return 'All systems secure'
      case 'MEDIUM':
        return 'Monitor mode active'
      case 'HIGH':
        return 'Enhanced security measures'
      case 'CRITICAL':
        return 'Immediate attention required'
      default:
        return 'Security status unknown'
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {getSecurityIcon()}
        <div className="hidden md:block">
          <div className="flex items-center space-x-2">
            <Badge className={`${getSecurityBadgeColor(level)} border`}>
              {level}
            </Badge>
            <span className="text-purple-300 text-sm">
              {getSecurityDescription()}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center space-x-2 text-xs text-purple-400">
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span>{isOnline ? 'Online' : 'Offline'}</span>
        <span>•</span>
        <span>{lastCheck.toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

export function SecuritySummary({ level, fraudScore }: { level: string; fraudScore: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-black/20 border border-purple-800/50 rounded-lg p-4">
        <h3 className="text-purple-300 text-sm font-medium mb-2">Security Level</h3>
        <div className="flex items-center space-x-2">
          <Badge className={`${getSecurityBadgeColor(level)} border`}>
            {level}
          </Badge>
        </div>
      </div>

      <div className="bg-black/20 border border-purple-800/50 rounded-lg p-4">
        <h3 className="text-purple-300 text-sm font-medium mb-2">Fraud Score</h3>
        <div className="text-2xl font-bold text-white">
          {fraudScore}/100
        </div>
      </div>

      <div className="bg-black/20 border border-purple-800/50 rounded-lg p-4">
        <h3 className="text-purple-300 text-sm font-medium mb-2">Last Check</h3>
        <div className="text-white">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}