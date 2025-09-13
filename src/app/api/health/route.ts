// Health Check API - Production Monitoring
import { NextResponse } from 'next/server'
import { dbUtils } from '@/lib/db'

export async function GET() {
  try {
    // Check database connection
    const dbHealth = await dbUtils.healthCheck()
    
    // Check if we're in maintenance mode
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: dbHealth.status,
        latency: dbHealth.latency
      },
      maintenance: isMaintenanceMode
    }

    // Return appropriate status code
    const statusCode = dbHealth.status === 'healthy' && !isMaintenanceMode ? 200 : 503

    return NextResponse.json(status, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}