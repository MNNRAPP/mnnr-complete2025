// AI-Powered Fraud Detection System - Advanced Machine Learning
// Implements real-time fraud scoring and behavioral analysis

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface FraudScore {
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: FraudFactor[];
  recommendations: string[];
}

export interface FraudFactor {
  type: string;
  weight: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TransactionData {
  userId: string;
  amount: number;
  merchant: string;
  location: {
    ip: string;
    country?: string;
    city?: string;
  };
  device: {
    fingerprint: string;
    userAgent: string;
  };
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserBehaviorProfile {
  userId: string;
  averageTransactionAmount: number;
  commonMerchants: string[];
  commonLocations: string[];
  transactionVelocity: number; // transactions per hour
  spendingPattern: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  riskTolerance: number; // 0-100
  lastUpdate: number;
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  
  static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }
  
  // Main fraud detection method
  async detectFraud(transaction: TransactionData): Promise<FraudScore> {
    const factors: FraudFactor[] = [];
    let totalScore = 0;
    
    // 1. Velocity analysis
    const velocityScore = await this.analyzeVelocity(transaction);
    factors.push({
      type: 'VELOCITY',
      weight: velocityScore.score,
      description: velocityScore.description,
      severity: velocityScore.riskLevel
    });
    totalScore += velocityScore.score * 0.25;
    
    // 2. Amount anomaly detection
    const amountScore = await this.analyzeAmountAnomaly(transaction);
    factors.push({
      type: 'AMOUNT_ANOMALY',
      weight: amountScore.score,
      description: amountScore.description,
      severity: amountScore.riskLevel
    });
    totalScore += amountScore.score * 0.30;
    
    // 3. Geographic anomaly detection
    const geoScore = await this.analyzeGeographicAnomaly(transaction);
    factors.push({
      type: 'GEOGRAPHIC_ANOMALY',
      weight: geoScore.score,
      description: geoScore.description,
      severity: geoScore.riskLevel
    });
    totalScore += geoScore.score * 0.20;
    
    // 4. Device fingerprinting
    const deviceScore = await this.analyzeDeviceFingerprint(transaction);
    factors.push({
      type: 'DEVICE_ANOMALY',
      weight: deviceScore.score,
      description: deviceScore.description,
      severity: deviceScore.riskLevel
    });
    totalScore += deviceScore.score * 0.15;
    
    // 5. Behavioral pattern analysis
    const behavioralScore = await this.analyzeBehavioralPattern(transaction);
    factors.push({
      type: 'BEHAVIORAL_ANOMALY',
      weight: behavioralScore.score,
      description: behavioralScore.description,
      severity: behavioralScore.riskLevel
    });
    totalScore += behavioralScore.score * 0.10;
    
    const finalScore = Math.min(100, Math.max(0, totalScore));
    const riskLevel = this.getRiskLevel(finalScore);
    const recommendations = this.generateRecommendations(factors);
    
    // Log fraud detection result
    await this.logFraudDetection(transaction, finalScore, factors);
    
    return {
      score: finalScore,
      riskLevel,
      factors,
      recommendations
    };
  }
  
  // Velocity analysis - detect unusual transaction frequency
  private async analyzeVelocity(transaction: TransactionData): Promise<{score: number, description: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentTransactions = await prisma.receipt.count({
      where: {
        userId: transaction.userId,
        createdAt: {
          gte: oneHourAgo
        }
      }
    });
    
    const profile = await this.getUserBehaviorProfile(transaction.userId);
    const expectedVelocity = profile.transactionVelocity;
    
    if (recentTransactions > expectedVelocity * 3) {
      return {
        score: 85,
        description: `Unusual velocity: ${recentTransactions} transactions in 1 hour (expected: ${Math.ceil(expectedVelocity)})`,
        riskLevel: 'HIGH'
      };
    } else if (recentTransactions > expectedVelocity * 2) {
      return {
        score: 60,
        description: `Elevated velocity: ${recentTransactions} transactions in 1 hour`,
        riskLevel: 'MEDIUM'
      };
    }
    
    return {
      score: 10,
      description: 'Normal transaction velocity',
      riskLevel: 'LOW'
    };
  }
  
  // Amount anomaly detection
  private async analyzeAmountAnomaly(transaction: TransactionData): Promise<{score: number, description: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const profile = await this.getUserBehaviorProfile(transaction.userId);
    const avgAmount = profile.averageTransactionAmount;
    const deviation = Math.abs(transaction.amount - avgAmount) / avgAmount;
    
    if (deviation > 2.0) { // 200% deviation
      return {
        score: 90,
        description: `Amount anomaly: $${transaction.amount} vs average $${avgAmount.toFixed(2)} (${(deviation * 100).toFixed(0)}% deviation)`,
        riskLevel: 'HIGH'
      };
    } else if (deviation > 1.0) { // 100% deviation
      return {
        score: 65,
        description: `Unusual amount: $${transaction.amount} vs average $${avgAmount.toFixed(2)}`,
        riskLevel: 'MEDIUM'
      };
    }
    
    return {
      score: 15,
      description: 'Amount within normal range',
      riskLevel: 'LOW'
    };
  }
  
  // Geographic anomaly detection
  private async analyzeGeographicAnomaly(transaction: TransactionData): Promise<{score: number, description: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const profile = await this.getUserBehaviorProfile(transaction.userId);
    const isNewLocation = !profile.commonLocations.includes(transaction.location.country || 'unknown');
    
    if (isNewLocation) {
      // Check for impossible travel
      const lastTransaction = await prisma.receipt.findFirst({
        where: { userId: transaction.userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      });
      
      if (lastTransaction && lastTransaction.createdAt) {
        const timeDiff = transaction.timestamp - lastTransaction.createdAt.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 2) {
          return {
            score: 95,
            description: 'Impossible travel detected - location change too fast',
            riskLevel: 'HIGH'
          };
        }
      }
      
      return {
        score: 50,
        description: `New location detected: ${transaction.location.country}`,
        riskLevel: 'MEDIUM'
      };
    }
    
    return {
      score: 5,
      description: 'Location within normal range',
      riskLevel: 'LOW'
    };
  }
  
  // Device fingerprinting
  private async analyzeDeviceFingerprint(transaction: TransactionData): Promise<{score: number, description: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const isNewDevice = !this.knownDevices.has(transaction.device.fingerprint);
    
    if (isNewDevice) {
      this.knownDevices.add(transaction.device.fingerprint);
      return {
        score: 40,
        description: 'New device detected',
        riskLevel: 'MEDIUM'
      };
    }
    
    return {
      score: 5,
      description: 'Recognized device',
      riskLevel: 'LOW'
    };
  }
  
  // Behavioral pattern analysis
  private async analyzeBehavioralPattern(transaction: TransactionData): Promise<{score: number, description: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'}> {
    const profile = await this.getUserBehaviorProfile(transaction.userId);
    const isNewMerchant = !profile.commonMerchants.includes(transaction.merchant);
    
    if (isNewMerchant) {
      return {
        score: 35,
        description: `New merchant: ${transaction.merchant}`,
        riskLevel: 'MEDIUM'
      };
    }
    
    return {
      score: 5,
      description: 'Behavioral pattern normal',
      riskLevel: 'LOW'
    };
  }
  
  // Get user behavior profile
  private async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    if (this.behaviorProfiles.has(userId)) {
      return this.behaviorProfiles.get(userId)!;
    }
    
    // Calculate behavior profile from historical data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const transactions = await prisma.receipt.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        totalAmount: true,
        merchantName: true,
        createdAt: true
      }
    });
    
    const avgAmount = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount.toString()), 0) / transactions.length
      : 100;
    
    const merchants = [...new Set(transactions.map(t => t.merchantName))].slice(0, 10);
    const velocity = transactions.length / (30 * 24); // transactions per hour
    
    const profile: UserBehaviorProfile = {
      userId,
      averageTransactionAmount: avgAmount,
      commonMerchants: merchants.filter(Boolean) as string[],
      commonLocations: ['US', 'CA'], // Simplified for demo
      transactionVelocity: velocity,
      spendingPattern: avgAmount > 500 ? 'AGGRESSIVE' : avgAmount > 100 ? 'MODERATE' : 'CONSERVATIVE',
      riskTolerance: 50,
      lastUpdate: Date.now()
    };
    
    this.behaviorProfiles.set(userId, profile);
    return profile;
  }
  
  // Risk level determination
  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }
  
  // Generate recommendations based on fraud factors
  private generateRecommendations(factors: FraudFactor[]): string[] {
    const recommendations: string[] = [];
    
    factors.forEach(factor => {
      switch (factor.type) {
        case 'VELOCITY':
          if (factor.severity === 'HIGH') {
            recommendations.push('Consider implementing rate limiting for this user');
            recommendations.push('Review recent transaction patterns');
          }
          break;
        case 'AMOUNT_ANOMALY':
          if (factor.severity === 'HIGH') {
            recommendations.push('Verify user identity before processing large transactions');
            recommendations.push('Consider requiring additional approval for high-value transactions');
          }
          break;
        case 'GEOGRAPHIC_ANOMALY':
          if (factor.severity === 'HIGH') {
            recommendations.push('Block transaction and require identity verification');
            recommendations.push('Notify user of suspicious activity');
          }
          break;
        case 'DEVICE_ANOMALY':
          recommendations.push('Consider implementing device fingerprinting');
          break;
        case 'BEHAVIORAL_ANOMALY':
          recommendations.push('Monitor user behavior for additional anomalies');
          break;
      }
    });
    
    return [...new Set(recommendations)];
  }
  
  // Log fraud detection results
  private async logFraudDetection(
    transaction: TransactionData, 
    score: number, 
    factors: FraudFactor[]
  ): Promise<void> {
    await prisma.fraudAlert.create({
      data: {
        userId: transaction.userId,
        type: 'SUSPICIOUS_TRANSACTION',
        severity: this.getRiskLevel(score),
        description: `Transaction fraud score: ${score}`,
        evidence: JSON.stringify({
          transaction,
          factors,
          timestamp: Date.now()
        })
      }
    });
  }
  
  // Known devices for fingerprinting
  private knownDevices: Set<string> = new Set();
}

export const fraudDetectionService = FraudDetectionService.getInstance();