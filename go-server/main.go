package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status      string            `json:"status"`
	Timestamp   string            `json:"timestamp"`
	Environment string            `json:"environment"`
	Version     string            `json:"version"`
	Uptime      float64           `json:"uptime"`
	Memory      map[string]uint64 `json:"memory"`
	GoVersion   string            `json:"go_version"`
}

var startTime = time.Now()

// healthHandler returns system health information
func healthHandler(w http.ResponseWriter, r *http.Request) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	response := HealthResponse{
		Status:      "ok",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Environment: getEnv("NODE_ENV", "development"),
		Version:     "1.0.0",
		Uptime:      time.Since(startTime).Seconds(),
		Memory: map[string]uint64{
			"alloc":       m.Alloc,
			"total_alloc": m.TotalAlloc,
			"sys":         m.Sys,
			"num_gc":      uint64(m.NumGC),
		},
		GoVersion: runtime.Version(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	json.NewEncoder(w).Encode(response)
}

// docsHandler serves the documentation page
func docsHandler(w http.ResponseWriter, r *http.Request) {
	html := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation - MNNR</title>
    <meta name="description" content="Complete documentation for MNNR platform features, security, and deployment guides.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(to bottom, #ffffff, #f7f7f7);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
        .header { text-align: center; margin-bottom: 4rem; }
        .header h1 { font-size: 2.5rem; color: #1a1a1a; margin-bottom: 1rem; }
        .header p { font-size: 1.25rem; color: #666; max-width: 800px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 4rem; }
        .card {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
        .card-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }
        .card-icon.green { background: #d4edda; color: #155724; }
        .card-icon.blue { background: #cce5ff; color: #004085; }
        .card-icon.purple { background: #e7d4f7; color: #5a1a7a; }
        .card-icon.orange { background: #ffe5cc; color: #cc5200; }
        .card-icon.gray { background: #e9ecef; color: #495057; }
        .card h2 { font-size: 1.5rem; margin-bottom: 1rem; color: #1a1a1a; }
        .card p { color: #666; margin-bottom: 1rem; line-height: 1.6; }
        .card a { color: #007bff; text-decoration: none; font-weight: 500; }
        .card a:hover { color: #0056b3; text-decoration: underline; }
        .security-badge {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
        }
        .badge-icon {
            width: 4rem;
            height: 4rem;
            background: #c3e6cb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
        }
        .security-badge h3 { font-size: 1.75rem; color: #155724; margin-bottom: 0.5rem; }
        .security-badge p { color: #155724; }
        .go-badge {
            display: inline-block;
            background: #00add8;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: bold;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MNNR Documentation</h1>
            <p>Everything you need to know about using, securing, and deploying the MNNR platform.</p>
            <div class="go-badge">⚡ Powered by Go</div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-icon green">🔒</div>
                <h2>Security Guide</h2>
                <p>Comprehensive security documentation covering our 10/10 security implementation.</p>
                <a href="/docs/security">Read Security Docs →</a>
            </div>

            <div class="card">
                <div class="card-icon blue">☁️</div>
                <h2>Deployment</h2>
                <p>Step-by-step production deployment guide with Vercel, Supabase, and monitoring setup.</p>
                <a href="/docs/deployment">View Deployment Guide →</a>
            </div>

            <div class="card">
                <div class="card-icon purple">💻</div>
                <h2>API Reference</h2>
                <p>Complete API documentation for webhooks, authentication, and subscription management.</p>
                <a href="/docs/api">Explore API →</a>
            </div>

            <div class="card">
                <div class="card-icon orange">🏢</div>
                <h2>Enterprise</h2>
                <p>Enterprise-grade features including monitoring, logging, and advanced security configurations.</p>
                <a href="/docs/enterprise">Enterprise Features →</a>
            </div>

            <div class="card">
                <div class="card-icon gray">📋</div>
                <h2>Changelog</h2>
                <p>Track all updates, security improvements, and new features in our detailed changelog.</p>
                <a href="/docs/changelog">View Changelog →</a>
            </div>

            <div class="card">
                <div class="card-icon green">⚡</div>
                <h2>Quick Start</h2>
                <p>Get up and running quickly with our step-by-step quick start guide.</p>
                <a href="/docs/quick-start">Quick Start Guide →</a>
            </div>
        </div>

        <div class="security-badge">
            <div class="badge-icon">✓</div>
            <h3>🔒 Security Score: 10/10</h3>
            <p>Enterprise-grade security with Redis rate limiting, Sentry monitoring, and comprehensive logging</p>
        </div>
    </div>
</body>
</html>`

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, html)
}

// securityHeadersMiddleware adds security headers to all responses
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Security headers
		w.Header().Set("X-DNS-Prefetch-Control", "on")
		w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		w.Header().Set("Server", "MNNR-Go")

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs all requests
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next.ServeHTTP(w, r)

		log.Printf(
			"%s %s %s %v",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			time.Since(start),
		)
	})
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	port := getEnv("PORT", "8080")

	router := mux.NewRouter()

	// API routes
	router.HandleFunc("/api/health", healthHandler).Methods("GET")

	// Docs routes
	router.HandleFunc("/docs", docsHandler).Methods("GET")
	router.HandleFunc("/", docsHandler).Methods("GET")

	// Apply middleware
	handler := securityHeadersMiddleware(router)
	handler = loggingMiddleware(handler)

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Authorization"},
		AllowCredentials: true,
	})

	handler = c.Handler(handler)

	log.Printf("🚀 MNNR Docs Server (Go) starting on port %s", port)
	log.Printf("📚 Documentation: http://localhost:%s/docs", port)
	log.Printf("❤️  Health Check: http://localhost:%s/api/health", port)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
