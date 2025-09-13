// Receipt List Component - Secure Receipt Management
'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate, getSecurityBadgeColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, DollarSign, AlertTriangle } from 'lucide-react'

interface Receipt {
  id: string
  merchantName: string
  transactionDate: string
  totalAmount: number
  currency: string
  category: string
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'FLAGGED'
  fraudRisk: number
  createdAt: string
}

export function ReceiptList() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching receipts
    const mockReceipts: Receipt[] = [
      {
        id: '1',
        merchantName: 'TechStore Inc',
        transactionDate: '2024-01-15T10:30:00Z',
        totalAmount: 299.99,
        currency: 'USD',
        category: 'Electronics',
        status: 'PROCESSED',
        fraudRisk: 15,
        createdAt: '2024-01-15T10:35:00Z'
      },
      {
        id: '2',
        merchantName: 'Coffee Shop',
        transactionDate: '2024-01-14T08:15:00Z',
        totalAmount: 12.50,
        currency: 'USD',
        category: 'Food & Beverage',
        status: 'PROCESSED',
        fraudRisk: 5,
        createdAt: '2024-01-14T08:20:00Z'
      },
      {
        id: '3',
        merchantName: 'Gas Station',
        transactionDate: '2024-01-13T18:45:00Z',
        totalAmount: 45.00,
        currency: 'USD',
        category: 'Transportation',
        status: 'FLAGGED',
        fraudRisk: 75,
        createdAt: '2024-01-13T18:50:00Z'
      }
    ]

    setTimeout(() => {
      setReceipts(mockReceipts)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'FLAGGED':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'FAILED':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/20 border-purple-800/50">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-purple-900/30 rounded w-3/4"></div>
                <div className="h-4 bg-purple-900/30 rounded w-1/2"></div>
                <div className="h-4 bg-purple-900/30 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {receipts.map((receipt) => (
        <Card key={receipt.id} className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">{receipt.merchantName}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getStatusColor(receipt.status)} border`}>
                  {receipt.status}
                </Badge>
                {receipt.fraudRisk > 50 && (
                  <Badge className={`${getSecurityBadgeColor('red')} border`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Risk
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200">{formatDate(receipt.transactionDate)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span className="text-white font-semibold">{formatCurrency(receipt.totalAmount)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">Category: {receipt.category}</span>
              <span className="text-purple-300">Added: {formatDate(receipt.createdAt)}</span>
            </div>
            
            {receipt.fraudRisk > 50 && (
              <div className="bg-red-900/20 border border-red-500/50 rounded p-2 mt-2">
                <p className="text-red-300 text-xs flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  High fraud risk detected ({receipt.fraudRisk}/100)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {receipts.length === 0 && (
        <Card className="bg-black/20 border-purple-800/50">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">No receipts yet</h3>
            <p className="text-purple-300">Upload your first receipt to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function FraudAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'SUSPICIOUS_LOGIN',
      severity: 'HIGH' as const,
      description: 'Login attempt from new location',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'ACTIVE'
    },
    {
      id: '2',
      type: 'UNUSUAL_TRANSACTION',
      severity: 'MEDIUM' as const,
      description: 'Transaction amount exceeds normal pattern',
      timestamp: '2024-01-14T09:15:00Z',
      status: 'INVESTIGATING'
    }
  ])

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-black/20 border border-purple-800/50 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            {getAlertIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{alert.description}</p>
              <p className="text-purple-300 text-xs">
                {formatDate(alert.timestamp)}
              </p>
            </div>
            <Badge className={`${getSecurityBadgeColor(alert.severity.toLowerCase())} border text-xs`}>
              {alert.severity}
            </Badge>
          </div>
        </div>
      ))}
      
      {alerts.length === 0 && (
        <p className="text-purple-300 text-center">No security alerts at this time</p>
      )}
    </div>
  )
}