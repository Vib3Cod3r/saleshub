# SalesHub CRM Lifecycle Logging Guide

This guide explains the comprehensive logging system implemented for tracking server lifecycle events including startup, shutdown, restart, and health monitoring.

## Overview

The SalesHub CRM application now includes a robust logging system that tracks all major lifecycle events with structured logging, file rotation, and comprehensive monitoring capabilities.

## Logging Components

### 1. Lifecycle Logging (`backend/config/lifecycle_logging.go`)

**Purpose**: Tracks server startup, shutdown, restart, and health events with structured metadata.

**Features**:
- Structured JSON-like logging format
- File and console output support
- Automatic log rotation
- Thread-safe logging with mutex protection
- Graceful shutdown handling

**Log Events**:
- `SERVER_START` - Server initialization
- `SERVER_STARTED` - Successful startup
- `SERVER_SHUTDOWN` - Graceful shutdown
- `SERVER_RESTART` - Server restart
- `DATABASE_START` - Database connection established
- `DATABASE_SHUTDOWN` - Database connection closed
- `HEALTH_CHECK` - Health check results
- `APPLICATION_ERROR` - Application errors
- `LIFECYCLE_CONFIG` - Logging configuration
- `LOG_ROTATION` - Log file rotation

### 2. Server Manager Script (`backend/scripts/server-manager.sh`)

**Purpose**: Manages server lifecycle operations with comprehensive logging.

**Commands**:
```bash
# Start the server
./backend/scripts/server-manager.sh start

# Stop the server gracefully
./backend/scripts/server-manager.sh stop

# Restart the server
./backend/scripts/server-manager.sh restart

# Check server status
./backend/scripts/server-manager.sh status

# View logs
./backend/scripts/server-manager.sh logs [server|lifecycle] [lines]

# Monitor server (auto-restart on failure)
./backend/scripts/server-manager.sh monitor

# Clean up old logs
./backend/scripts/server-manager.sh cleanup [days]
```

### 3. Health Check Script (`backend/scripts/health-check.sh`)

**Purpose**: Validates environment and dependencies before server startup.

**Checks**:
- Go installation and version
- PostgreSQL connectivity
- Port availability
- Required directories and files
- Environment variables
- Disk space and memory

## Log File Structure

### Lifecycle Log (`backend/logs/lifecycle.log`)

```
[LIFECYCLE-SERVER_START] 2024-01-15T10:30:00Z | SalesHub CRM API server starting | Metadata: map[port:8089 environment:development pid:12345 hostname:server01 version:1.0.0 gin_mode:development]
[LIFECYCLE-SERVER_STARTED] 2024-01-15T10:30:02Z | SalesHub CRM API server started successfully | Metadata: map[port:8089 startup_time_ms:2000 status:running]
[LIFECYCLE-HEALTH_CHECK] 2024-01-15T10:35:00Z | Health check performed | Metadata: map[status:healthy response_time_ms:15 endpoint:/health]
[LIFECYCLE-SERVER_SHUTDOWN] 2024-01-15T18:00:00Z | SalesHub CRM API server shutting down | Metadata: map[reason:graceful_shutdown uptime_seconds:27000 status:shutting_down]
```

### Server Log (`backend/logs/server.log`)

Contains standard server output including:
- Gin framework logs
- Database operations
- API requests and responses
- Error messages

### Health Check Log (`backend/logs/health-check.log`)

```
[2024-01-15 10:30:00] [INFO] Starting health check for SalesHub CRM server...
[2024-01-15 10:30:00] [INFO] Go is installed: go1.21.0
[2024-01-15 10:30:01] [INFO] PostgreSQL connection successful
[2024-01-15 10:30:01] [INFO] All health checks passed. Server is ready to start.
```

## Configuration

### Lifecycle Logging Configuration

```go
config := &LifecycleLogConfig{
    LogFile:            "lifecycle.log",
    LogLevel:           "INFO",
    EnableFileLogging:  true,
    EnableConsoleLogging: true,
    MaxFileSize:        10 * 1024 * 1024, // 10MB
    MaxBackups:         5,
    MaxAge:             30, // 30 days
}
```

### Environment Variables

```bash
# Server Configuration
ENV=development
PORT=8089

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sales_crm
DB_USER=postgres
DB_PASSWORD=Miyako2020

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
```

## Usage Examples

### Starting the Server

```bash
# Using the server manager script
cd backend
./scripts/server-manager.sh start

# Direct Go execution
go run cmd/server/main.go
```

### Monitoring Server Status

```bash
# Check if server is running
./scripts/server-manager.sh status

# View recent lifecycle events
./scripts/server-manager.sh logs lifecycle 20

# View server logs
./scripts/server-manager.sh logs server 50
```

### Graceful Shutdown

The server implements graceful shutdown handling:

1. **Signal Handling**: Listens for SIGINT and SIGTERM signals
2. **Graceful Shutdown**: Allows 30 seconds for active connections to complete
3. **Force Shutdown**: Kills the process if graceful shutdown fails
4. **Logging**: Records shutdown reason and uptime

```bash
# Graceful shutdown
./scripts/server-manager.sh stop

# Or send signal directly
kill -TERM $(cat backend/server.pid)
```

### Health Monitoring

```bash
# Run health check manually
./scripts/health-check.sh

# Monitor server continuously
./scripts/server-manager.sh monitor
```

## Production Deployment

### Systemd Service

For production deployment, use the provided systemd service file:

```bash
# Copy service file
sudo cp backend/systemd/saleshub-crm.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable saleshub-crm
sudo systemctl start saleshub-crm

# Check status
sudo systemctl status saleshub-crm

# View logs
sudo journalctl -u saleshub-crm -f
```

### Docker Deployment

For Docker deployment, the logging is integrated into the container:

```bash
# Build and run with logging
docker build -t saleshub-crm backend/
docker run -d \
  --name saleshub-crm \
  -p 8089:8089 \
  -v $(pwd)/backend/logs:/app/logs \
  saleshub-crm
```

## Log Analysis

### Common Log Patterns

1. **Normal Startup**:
   ```
   [LIFECYCLE-SERVER_START] → [LIFECYCLE-SERVER_STARTED]
   ```

2. **Graceful Shutdown**:
   ```
   [LIFECYCLE-SERVER_SHUTDOWN] → [LIFECYCLE-LIFECYCLE_SHUTDOWN]
   ```

3. **Health Check Failure**:
   ```
   [LIFECYCLE-HEALTH_CHECK] status:unhealthy
   ```

4. **Application Error**:
   ```
   [LIFECYCLE-APPLICATION_ERROR] component:database operation:connect
   ```

### Log Rotation

Logs are automatically rotated when they exceed the configured size:

- **Max File Size**: 10MB (configurable)
- **Max Backups**: 5 files (configurable)
- **Max Age**: 30 days (configurable)

### Monitoring and Alerting

Set up monitoring for:

1. **Server Status**: Check if server is running
2. **Health Checks**: Monitor response times and status
3. **Error Rates**: Track application errors
4. **Uptime**: Monitor server availability
5. **Resource Usage**: Disk space, memory, CPU

## Troubleshooting

### Common Issues

1. **Server Won't Start**:
   ```bash
   # Check health check
   ./scripts/health-check.sh
   
   # Check logs
   ./scripts/server-manager.sh logs lifecycle
   ```

2. **Server Crashes**:
   ```bash
   # Check server logs
   ./scripts/server-manager.sh logs server
   
   # Check for errors
   grep -i error backend/logs/server.log
   ```

3. **Database Connection Issues**:
   ```bash
   # Test database connection
   PGPASSWORD=Miyako2020 psql -h localhost -p 5432 -U postgres -d sales_crm -c "SELECT 1;"
   ```

4. **Port Already in Use**:
   ```bash
   # Check what's using the port
   netstat -tuln | grep :8089
   
   # Kill existing process
   sudo lsof -ti:8089 | xargs kill -9
   ```

### Log File Locations

- **Lifecycle Logs**: `backend/logs/lifecycle.log`
- **Server Logs**: `backend/logs/server.log`
- **Health Check Logs**: `backend/logs/health-check.log`
- **PID File**: `backend/server.pid`
- **Lock File**: `backend/server.lock`

## Best Practices

1. **Regular Monitoring**: Set up automated monitoring for log patterns
2. **Log Rotation**: Configure appropriate log rotation settings
3. **Backup Logs**: Regularly backup important log files
4. **Security**: Ensure log files have appropriate permissions
5. **Documentation**: Document any custom logging configurations

## Integration with Existing Logging

The lifecycle logging system integrates with existing logging:

- **API Logging**: Middleware for request/response logging
- **Database Logging**: GORM query and performance logging
- **Error Logging**: Application error tracking

All logging systems work together to provide comprehensive observability of the SalesHub CRM application.
