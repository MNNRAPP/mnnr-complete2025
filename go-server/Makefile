# MNNR Docs Server - Go Makefile

.PHONY: help build run test clean docker-build docker-run deploy

# Default target
help:
	@echo "MNNR Docs Server - Available commands:"
	@echo ""
	@echo "  make build         - Build the Go binary"
	@echo "  make run           - Run the server locally"
	@echo "  make test          - Run tests"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-run    - Run Docker container"
	@echo "  make deploy        - Deploy to production"
	@echo ""

# Build the application
build:
	@echo "🔨 Building Go server..."
	go build -o server main.go
	@echo "✓ Build complete: ./server"

# Run the server locally
run:
	@echo "🚀 Starting MNNR Docs Server..."
	go run main.go

# Run tests
test:
	@echo "🧪 Running tests..."
	go test -v ./...

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f server
	rm -f *.exe
	@echo "✓ Clean complete"

# Initialize Go modules
init:
	@echo "📦 Initializing Go modules..."
	go mod init github.com/mnnr/docs-server || true
	go mod tidy
	@echo "✓ Modules initialized"

# Download dependencies
deps:
	@echo "📥 Downloading dependencies..."
	go mod download
	go get github.com/gorilla/mux
	go get github.com/rs/cors
	go mod tidy
	@echo "✓ Dependencies downloaded"

# Build Docker image
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t mnnr-docs-server:latest .
	@echo "✓ Docker image built: mnnr-docs-server:latest"

# Run Docker container
docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 --name mnnr-docs mnnr-docs-server:latest

# Stop Docker container
docker-stop:
	@echo "🛑 Stopping Docker container..."
	docker stop mnnr-docs || true
	docker rm mnnr-docs || true

# Deploy to production (Railway)
deploy:
	@echo "🚀 Deploying to production..."
	railway up

# Development mode with auto-reload
dev:
	@echo "🔧 Starting development mode..."
	@command -v air > /dev/null || go install github.com/cosmtrek/air@latest
	air

# Format code
fmt:
	@echo "✨ Formatting code..."
	go fmt ./...
	@echo "✓ Code formatted"

# Lint code
lint:
	@echo "🔍 Linting code..."
	@command -v golangci-lint > /dev/null || go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	golangci-lint run
	@echo "✓ Linting complete"

# Run locally with production settings
prod-local:
	@echo "🎯 Running with production settings..."
	NODE_ENV=production PORT=8080 go run main.go

# Generate go.sum
tidy:
	@echo "📋 Tidying modules..."
	go mod tidy
	@echo "✓ Modules tidied"
