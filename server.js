const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT) || 3000

console.log(`🚀 Starting MNNR server...`)
console.log(`📦 Environment: ${dev ? 'development' : 'production'}`)
console.log(`🌐 Port: ${port} (Railway provided: ${process.env.PORT})`)
console.log(`🔗 Host: ${hostname}`)
console.log(`🔄 Build Version: 2025-10-05-v2`)
console.log(`📁 API Routes Available: health, auth, webhooks, v1`)

// Initialize the Next.js app
const app = next({ dev })
const handle = app.getRequestHandler()

async function startServer() {
  try {
    console.log(`⏳ Preparing Next.js app...`)
    await app.prepare()
    console.log(`✅ Next.js app prepared successfully`)
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('❌ Request handling error:', err)
        res.statusCode = 500
        res.end('Internal server error')
      }
    })

    server.on('error', (err) => {
      console.error('❌ Server error:', err)
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`)
        // Try a different port
        const newPort = port + 1
        console.log(`🔄 Trying port ${newPort}...`)
        server.listen(newPort, hostname)
        return
      }
      process.exit(1)
    })

    server.listen(port, hostname, () => {
      console.log(`🎉 MNNR server ready!`)
      console.log(`🌍 URL: http://${hostname}:${port}`)
      console.log(`📊 Process ID: ${process.pid}`)
      console.log(`🔧 Node version: ${process.version}`)
      console.log(`🚂 Railway URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:' + port}`)
    })

  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

startServer()