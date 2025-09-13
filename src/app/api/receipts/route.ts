// Receipts API Route - Secure Receipt Processing
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encryptionService } from '@/lib/security/encryption'
import { fraudDetectionService } from '@/lib/security/fraud-detection'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where = {
      userId: session.user.id,
      ...(status && { status }),
      deletedAt: null
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          merchantName: true,
          transactionDate: true,
          totalAmount: true,
          currency: true,
          category: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.receipt.count({ where })
    ])

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchantName, transactionDate, totalAmount, taxAmount, items, paymentMethod } = body

    // Validate required fields
    if (!merchantName || !transactionDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fraud detection
    const fraudScore = await fraudDetectionService.detectFraud({
      userId: session.user.id,
      amount: parseFloat(totalAmount),
      merchant: merchantName,
      location: {
        ip: request.ip || 'unknown',
        country: 'US', // Would be determined from IP
        city: 'unknown'
      },
      device: {
        fingerprint: request.headers.get('user-agent') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      timestamp: Date.now()
    })

    // Encrypt sensitive data
    const encryptedMerchant = encryptionService.encryptField(merchantName)
    const encryptedItems = items ? encryptionService.encryptField(JSON.stringify(items)) : null
    const encryptedPayment = paymentMethod ? encryptionService.encryptField(paymentMethod) : null

    // Create receipt with security features
    const receipt = await prisma.receipt.create({
      data: {
        userId: session.user.id,
        merchantName: encryptedMerchant.data,
        merchantAddress: null, // Would be encrypted from receipt processing
        transactionDate: new Date(transactionDate),
        totalAmount: parseFloat(totalAmount),
        taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
        currency: 'USD',
        items: encryptedItems?.data || null,
        paymentMethod: encryptedPayment?.data || null,
        category: 'UNCATEGORIZED', // Would be determined by AI
        confidenceScore: 0.0,
        fraudRisk: fraudScore.score,
        status: fraudScore.score > 70 ? 'FLAGGED' : 'PENDING',
        imageUrl: null,
        ocrText: null
      }
    })

    // Log security event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'RECEIPT_CREATED',
        resource: 'RECEIPT',
        details: JSON.stringify({
          receiptId: receipt.id,
          fraudScore: fraudScore.score,
          riskLevel: fraudScore.riskLevel,
          timestamp: new Date().toISOString()
        }),
        severity: fraudScore.score > 70 ? 'WARNING' : 'INFO'
      }
    })

    return NextResponse.json({
      receipt: {
        id: receipt.id,
        merchantName,
        transactionDate,
        totalAmount,
        currency: receipt.currency,
        category: receipt.category,
        status: receipt.status,
        fraudRisk: receipt.fraudRisk,
        createdAt: receipt.createdAt
      },
      fraudScore
    })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    )
  }
}