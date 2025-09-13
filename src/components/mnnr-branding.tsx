// MNNR Branding Component - Enterprise Brand Identity
'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Brain } from 'lucide-react'

export function MNNRBranding() {
  return (
    <motion.div 
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <div className="relative">
        <motion.div 
          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="w-6 h-6 text-white" />
        </motion.div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Brand Text */}
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          MNNR Platform
        </h1>
        <p className="text-xs text-purple-300">
          Enterprise Security
        </p>
      </div>

      {/* Features Indicators */}
      <div className="hidden md:flex items-center space-x-2 ml-4">
        <div className="flex items-center space-x-1 text-green-400">
          <Zap className="w-3 h-3" />
          <span className="text-xs">AI</span>
        </div>
        <div className="flex items-center space-x-1 text-blue-400">
          <Brain className="w-3 h-3" />
          <span className="text-xs">ML</span>
        </div>
      </div>
    </motion.div>
  )
}

export function MNNRFooter() {
  return (
    <div className="text-center space-y-2">
      <p className="text-purple-300 text-sm">
        Military-Grade Security • AI-Powered Fraud Detection
      </p>
      <p className="text-purple-400 text-xs">
        Advanced encryption and real-time threat monitoring
      </p>
    </div>
  )
}