// Analytics Dashboard Component - AI-Powered Insights
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalSpent: 45892.50,
    totalReceipts: 1247,
    averageTransaction: 36.80,
    categories: [
      { name: 'Food & Beverage', amount: 12450.30, percentage: 27.1 },
      { name: 'Electronics', amount: 8920.15, percentage: 19.4 },
      { name: 'Transportation', amount: 6750.80, percentage: 14.7 },
      { name: 'Entertainment', amount: 5280.25, percentage: 11.5 },
      { name: 'Other', amount: 12491.00, percentage: 27.3 }
    ],
    monthlyTrend: [
      { month: 'Oct', amount: 3850.20 },
      { month: 'Nov', amount: 4200.15 },
      { month: 'Dec', amount: 4892.50 }
    ],
    fraudDetection: {
      totalAlerts: 23,
      resolved: 18,
      falsePositives: 3,
      activeThreats: 2
    }
  })

  const currentMonthChange = ((analytics.monthlyTrend[2].amount - analytics.monthlyTrend[1].amount) / analytics.monthlyTrend[1].amount) * 100

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Total Spent</CardTitle>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(analytics.totalSpent)}</div>
            <p className="text-xs text-purple-300">Across all receipts</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Monthly Change</CardTitle>
            {currentMonthChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{currentMonthChange.toFixed(1)}%</div>
            <p className="text-xs text-purple-300">vs previous month</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Avg Transaction</CardTitle>
            <PieChart className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(analytics.averageTransaction)}</div>
            <p className="text-xs text-purple-300">Per receipt</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Fraud Alerts</CardTitle>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.fraudDetection.activeThreats}</div>
            <p className="text-xs text-purple-300">Active threats</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">{category.name}</span>
                  <span className="text-white font-medium">{formatCurrency(category.amount)}</span>
                </div>
                <div className="w-full bg-purple-900/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-purple-400 text-right">{category.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fraud Detection Summary */}
      <Card className="bg-black/20 border-purple-800/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">Fraud Detection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analytics.fraudDetection.totalAlerts}</div>
              <p className="text-purple-300 text-sm">Total Alerts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{analytics.fraudDetection.resolved}</div>
              <p className="text-purple-300 text-sm">Resolved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{analytics.fraudDetection.falsePositives}</div>
              <p className="text-purple-300 text-sm">False Positives</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{analytics.fraudDetection.activeThreats}</div>
              <p className="text-purple-300 text-sm">Active Threats</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}