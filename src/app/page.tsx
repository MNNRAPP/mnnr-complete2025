// Main Dashboard - Enterprise Receipt Management Interface
// Implements secure dashboard with fraud detection and analytics

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MNNRBranding } from '@/components/mnnr-branding'
import { SecurityStatus } from '@/components/security-status'
import { ReceiptUpload } from '@/components/receipt-upload'
import { ReceiptList } from '@/components/receipt-list'
import { FraudAlerts } from '@/components/fraud-alerts'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [securityLevel, setSecurityLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW')
  const [fraudScore, setFraudScore] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      setSecurityLevel(session.user.riskLevel as any)
      setFraudScore(session.user.fraudScore)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading MNNR Platform...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/50 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <MNNRBranding />
            
            <div className="flex items-center space-x-4">
              <SecurityStatus 
                level={securityLevel} 
                fraudScore={fraudScore}
                userEmail={session?.user?.email || ''}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name || 'User'}
          </h1>
          <p className="text-purple-200 text-lg">
            Your secure receipt management platform with AI-powered fraud detection
          </p>
        </div>

        {/* Security Status Banner */}
        {fraudScore > 70 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <div>
                <h3 className="text-red-200 font-semibold">High Security Alert</h3>
                <p className="text-red-300 text-sm">
                  Unusual activity detected. Enhanced security measures are active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/20 border border-purple-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="receipts" className="data-[state=active]:bg-purple-600">
              Receipts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Total Receipts
                  </CardTitle>
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <p className="text-xs text-purple-300">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Security Score
                  </CardTitle>
                  <div className={`w-4 h-4 rounded-full ${
                    fraudScore < 30 ? 'bg-green-500' : 
                    fraudScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(100 - fraudScore)}
                  </div>
                  <p className="text-xs text-purple-300">
                    {fraudScore < 30 ? 'Excellent' : fraudScore < 60 ? 'Good' : 'Needs Attention'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Total Value
                  </CardTitle>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$45,892</div>
                  <p className="text-xs text-purple-300">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-200">
                    Fraud Alerts
                  </CardTitle>
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">3</div>
                  <p className="text-xs text-purple-300">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-purple-300">
                    Upload receipts and manage your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ReceiptUpload />
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-purple-300">
                    Latest transactions and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FraudAlerts />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Receipt Management</CardTitle>
                <CardDescription className="text-purple-300">
                  Upload and manage your receipts with AI-powered processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Security Status</CardTitle>
                  <CardDescription className="text-purple-300">
                    Current security level and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Security Level:</span>
                      <Badge 
                        variant={securityLevel === 'LOW' ? 'default' : 'destructive'}
                        className={`${
                          securityLevel === 'LOW' ? 'bg-green-600' :
                          securityLevel === 'MEDIUM' ? 'bg-yellow-600' :
                          securityLevel === 'HIGH' ? 'bg-orange-600' : 'bg-red-600'
                        } text-white`}
                      >
                        {securityLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Fraud Score:</span>
                      <span className="text-white font-mono">{fraudScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Last Scan:</span>
                      <span className="text-white">2 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Multi-Factor Authentication</CardTitle>
                  <CardDescription className="text-purple-300">
                    Enhanced security options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">2FA Status:</span>
                      <Badge 
                        variant={session?.user?.twoFactorEnabled ? 'default' : 'destructive'}
                        className={`${
                          session?.user?.twoFactorEnabled ? 'bg-green-600' : 'bg-red-600'
                        } text-white`}
                      >
                        {session?.user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Biometric:</span>
                      <Badge 
                        variant={session?.user?.biometricEnabled ? 'default' : 'destructive'}
                        className={`${
                          session?.user?.biometricEnabled ? 'bg-green-600' : 'bg-gray-600'
                        } text-white`}
                      >
                        {session?.user?.biometricEnabled ? 'Enabled' : 'Not Configured'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-800/50 bg-black/20 backdrop-blur-lg mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-300">
            <p className="mb-2">MNNR Platform - Military-Grade Security • AI-Powered Fraud Detection</p>
            <p className="text-sm text-purple-400">
              Protected by advanced encryption and real-time threat monitoring
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}