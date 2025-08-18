# SalesHub CRM Anti-Bloat Rules & Guidelines

## 🎯 Core Principles

### **Brevity Over Verbosity**
- Write the minimum code necessary to solve the problem
- Prefer one-liners over multi-line solutions when possible
- Use built-in language features over custom implementations

### **Clarity Over Cleverness**
- Readable solutions over overly complex ones
- Self-documenting code over extensive comments
- Standard patterns over custom abstractions

### **Standard Library First**
- Use built-in functions before creating custom implementations
- Leverage language features over third-party libraries
- Prefer native APIs over wrapper functions

### **Single Responsibility**
- Each function/class should have one clear purpose
- Avoid functions that do multiple things
- Keep components focused and composable

### **Eliminate Redundancy**
- Remove duplicate logic, unused imports, and dead code
- Consolidate similar functionality
- Avoid copy-paste programming

## 📋 Code Quality Checklist

### **Before Writing Code**
- [ ] Is this functionality already available in the standard library?
- [ ] Can this be solved with fewer functions/classes?
- [ ] Are there built-in methods that replace custom logic?
- [ ] Can multiple operations be combined efficiently?

### **Before Committing**
- [ ] Are all imports actually used?
- [ ] Are there any commented-out code blocks?
- [ ] Are there unused variables or functions?
- [ ] Can any functions be simplified or combined?
- [ ] Are there redundant conditionals or checks?

## 🏗️ Architecture Rules

### **File Size Limits**
```
Frontend Components:  ≤ 200 lines
Backend Handlers:     ≤ 150 lines
Utility Functions:    ≤ 50 lines
Configuration Files:  ≤ 100 lines
Scripts:             ≤ 100 lines
```

### **Function Design**
```
Max Parameters:       3-4
Max Nesting Levels:   3
Max Lines per Function: 20
Max Lines per Class:    100
```

### **Import Optimization**
```typescript
// ❌ Bloated
import * as React from 'react'
import { useState, useEffect, useCallback, useMemo, useContext } from 'react'

// ✅ Lean
import { useState, useEffect } from 'react'
```

## 🔧 Language-Specific Guidelines

### **TypeScript/JavaScript**
```typescript
// ❌ Bloated
function processUserData(userDataDict: any) {
  if (userDataDict !== null && userDataDict !== undefined) {
    if ('name' in userDataDict) {
      const userName = userDataDict.name
      if (userName !== null && userName !== undefined && userName !== '') {
        const processedName = userName.trim().toLowerCase()
        return processedName
      }
    }
  }
  return null
}

// ✅ Lean
const processUserName = (data: any) => 
  data?.name?.trim().toLowerCase() || null
```

### **Go (Backend)**
```go
// ❌ Bloated
func processUserData(userData map[string]interface{}) (string, error) {
    if userData == nil {
        return "", errors.New("user data is nil")
    }
    
    name, exists := userData["name"]
    if !exists {
        return "", errors.New("name field not found")
    }
    
    nameStr, ok := name.(string)
    if !ok {
        return "", errors.New("name is not a string")
    }
    
    if nameStr == "" {
        return "", errors.New("name is empty")
    }
    
    processedName := strings.TrimSpace(strings.ToLower(nameStr))
    return processedName, nil
}

// ✅ Lean
func processUserName(data map[string]interface{}) string {
    if name, ok := data["name"].(string); ok {
        return strings.TrimSpace(strings.ToLower(name))
    }
    return ""
}
```

### **Shell Scripts**
```bash
# ❌ Bloated
#!/bin/bash
# Comprehensive server management script with extensive logging
set -e

# Configuration variables
SERVER_NAME="saleshub-crm"
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$SERVER_DIR/server.pid"
LOG_DIR="$SERVER_DIR/logs"
LIFECYCLE_LOG="$LOG_DIR/lifecycle.log"
SERVER_LOG="$LOG_DIR/server.log"
LOCK_FILE="$SERVER_DIR/server.lock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging functions
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LIFECYCLE_LOG"
}

# ... 200+ more lines

# ✅ Lean
#!/bin/bash
set -e

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$SERVER_DIR/server.pid"

log() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }

is_running() {
    [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
    if is_running; then warn "Already running"; return 1; fi
    cd "$SERVER_DIR"
    nohup go run cmd/server/main.go > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    log "Started (PID: $!)"
}

# ... 50 lines total
```

## 🎨 Frontend-Specific Rules

### **Component Design**
```typescript
// ❌ Bloated Component
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [contacts, setContacts] = useState([])
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [loadingDeals, setLoadingDeals] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const fetchCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8089/api/crm/companies?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoadingCompanies(false)
    }
  }

  // ... repeat for contacts, leads, deals (80+ lines)

// ✅ Lean Component
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data: companies } = useQuery({
    queryKey: ['companies', { limit: 5 }],
    queryFn: () => apiClient.crm.companies(5),
    enabled: !!user,
  })

  // ... 3 more similar queries (20 lines total)
```

### **API Client Design**
```typescript
// ❌ Bloated API Calls
const fetchCompanies = async () => {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:8089/api/crm/companies?limit=5', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// ✅ Lean API Client
const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },

  crm: {
    companies: (limit = 5) => apiClient.fetch(`/crm/companies?limit=${limit}`),
    contacts: (limit = 5) => apiClient.fetch(`/crm/contacts?limit=${limit}`),
    leads: (limit = 5) => apiClient.fetch(`/crm/leads?limit=${limit}`),
    deals: (limit = 5) => apiClient.fetch(`/crm/deals?limit=${limit}`),
  }
}
```

## 🔧 Backend-Specific Rules

### **Handler Design**
```go
// ❌ Bloated Handler
func GetCompanies(c *gin.Context) {
    // Log request start
    startTime := time.Now()
    requestID := uuid.New().String()
    
    log.Printf("[%s] GET /api/crm/companies - Request started", requestID)
    
    // Validate user authentication
    userID, exists := c.Get("userID")
    if !exists {
        log.Printf("[%s] Authentication failed - userID not found in context", requestID)
        c.JSON(http.StatusUnauthorized, gin.H{
            "error": "Authentication required",
            "message": "User not authenticated",
            "timestamp": time.Now().Format(time.RFC3339),
            "request_id": requestID,
        })
        return
    }
    
    // Parse query parameters
    limitStr := c.Query("limit")
    var limit int = 10 // default
    if limitStr != "" {
        var err error
        limit, err = strconv.Atoi(limitStr)
        if err != nil {
            log.Printf("[%s] Invalid limit parameter: %s", requestID, limitStr)
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Invalid limit parameter",
                "message": "Limit must be a valid integer",
                "timestamp": time.Now().Format(time.RFC3339),
                "request_id": requestID,
            })
            return
        }
    }
    
    // Database query with extensive error handling
    var companies []models.Company
    result := db.Where("user_id = ?", userID).Limit(limit).Find(&companies)
    if result.Error != nil {
        log.Printf("[%s] Database error: %v", requestID, result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Database error",
            "message": "Failed to fetch companies",
            "timestamp": time.Now().Format(time.RFC3339),
            "request_id": requestID,
        })
        return
    }
    
    // Log success
    duration := time.Since(startTime)
    log.Printf("[%s] GET /api/crm/companies - Success (duration: %v, companies: %d)", 
        requestID, duration, len(companies))
    
    c.JSON(http.StatusOK, gin.H{
        "companies": companies,
        "count": len(companies),
        "timestamp": time.Now().Format(time.RFC3339),
        "request_id": requestID,
        "duration": duration.String(),
    })
}

// ✅ Lean Handler
func GetCompanies(c *gin.Context) {
    userID := c.GetString("userID")
    limit := c.DefaultQuery("limit", "10")
    
    var companies []models.Company
    if err := db.Where("user_id = ?", userID).Limit(limit).Find(&companies).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companies"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"companies": companies})
}
```

### **Middleware Design**
```go
// ❌ Bloated Middleware
func APILogger(config APILoggerConfig) gin.HandlerFunc {
    return func(c *gin.Context) {
        startTime := time.Now()
        requestID := uuid.New().String()
        
        // Add request ID to context
        c.Set("requestID", requestID)
        
        // Log request start
        log.Printf("[%s] %s %s - Request started", 
            requestID, c.Request.Method, c.Request.URL.Path)
        
        // Process request
        c.Next()
        
        // Calculate duration
        duration := time.Since(startTime)
        
        // Log response
        status := c.Writer.Status()
        log.Printf("[%s] %s %s - %d (duration: %v)", 
            requestID, c.Request.Method, c.Request.URL.Path, status, duration)
        
        // Log slow requests
        if duration > config.SlowRequestThreshold {
            log.Printf("[%s] SLOW REQUEST: %s %s took %v", 
                requestID, c.Request.Method, c.Request.URL.Path, duration)
        }
        
        // Log errors
        if status >= 400 {
            log.Printf("[%s] ERROR: %s %s returned %d", 
                requestID, c.Request.Method, c.Request.URL.Path, status)
        }
    }
}

// ✅ Lean Middleware
func APILogger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        log.Printf("%s %s %d %v", c.Request.Method, c.Request.URL.Path, c.Writer.Status(), time.Since(start))
    }
}
```

## 📁 File Organization Rules

### **Directory Structure**
```
frontend/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utilities and API clients (≤ 5 files)
│   ├── hooks/        # Custom React hooks
│   └── types/        # TypeScript type definitions
│
backend/
├── cmd/              # Application entry points
├── handlers/         # HTTP request handlers
├── middleware/       # HTTP middleware
├── models/           # Database models
├── config/           # Configuration
└── scripts/          # Utility scripts (≤ 3 files)
```

### **File Naming**
```
Components:     PascalCase (UserProfile.tsx)
Hooks:         camelCase (useAuth.ts)
Utilities:     camelCase (apiClient.ts)
Handlers:      snake_case (user_handler.go)
Models:        snake_case (user_model.go)
Scripts:       kebab-case (server-manager.sh)
```

## 🚫 Anti-Patterns to Avoid

### **Over-Engineering**
```typescript
// ❌ Don't create abstractions for simple data
class UserDataContainer {
  private data: any
  
  constructor(data: any) {
    this.data = data
  }
  
  getName(): string {
    return this.data.name
  }
  
  getEmail(): string {
    return this.data.email
  }
}

// ✅ Use simple objects
type User = {
  name: string
  email: string
}
```

### **Premature Optimization**
```typescript
// ❌ Don't add caching without requirements
const memoizedExpensiveCalculation = useMemo(() => {
  return expensiveCalculation(data)
}, [data])

// ✅ Simple calculation
const result = expensiveCalculation(data)
```

### **Defensive Programming Overload**
```typescript
// ❌ Don't add excessive validation
function processData(data: any) {
  try {
    if (data === null || data === undefined) {
      throw new Error('Data is null or undefined')
    }
    
    if (typeof data !== 'object') {
      throw new Error('Data must be an object')
    }
    
    if (!data.hasOwnProperty('name')) {
      throw new Error('Data must have name property')
    }
    
    if (typeof data.name !== 'string') {
      throw new Error('Name must be a string')
    }
    
    return data.name.trim()
  } catch (error) {
    console.error('Error processing data:', error)
    return null
  }
}

// ✅ Simple validation
const processData = (data: any) => data?.name?.trim() || null
```

### **Configuration Overengineering**
```typescript
// ❌ Don't make everything configurable
const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8089',
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
    retries: parseInt(process.env.API_RETRIES || '3'),
    headers: {
      'Content-Type': process.env.API_CONTENT_TYPE || 'application/json',
      'Accept': process.env.API_ACCEPT || 'application/json',
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    destination: process.env.LOG_DESTINATION || 'console',
  }
}

// ✅ Simple configuration
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8089'
```

## 🔄 Scalability Guidelines

### **When to Add Complexity**
- **Performance Requirements**: Only optimize when there are measurable performance issues
- **Team Size**: Add abstractions when team grows beyond 3-4 developers
- **Feature Complexity**: Introduce patterns when features become complex
- **Maintenance Burden**: Refactor when code becomes hard to maintain

### **Progressive Enhancement**
1. **Start Simple**: Begin with the simplest solution
2. **Measure**: Monitor performance and complexity
3. **Optimize**: Only add complexity when needed
4. **Document**: Document why complexity was added

### **Code Review Checklist**
- [ ] Is this the simplest solution?
- [ ] Are there built-in alternatives?
- [ ] Can this be broken down further?
- [ ] Is the complexity justified?
- [ ] Will this be easy to maintain?

## 🎛️ Customization Guidelines

### **Environment-Specific Rules**
```typescript
// Development: Verbose logging
if (process.env.NODE_ENV === 'development') {
  console.log('API call:', endpoint, data)
}

// Production: Minimal logging
if (process.env.NODE_ENV === 'production') {
  // Only log errors
}
```

### **Feature Flags**
```typescript
// Enable/disable features without code changes
const FEATURES = {
  advancedLogging: process.env.ENABLE_ADVANCED_LOGGING === 'true',
  detailedErrors: process.env.ENABLE_DETAILED_ERRORS === 'true',
  performanceMonitoring: process.env.ENABLE_PERF_MONITORING === 'true',
}
```

### **User Preferences**
```typescript
// Allow users to customize behavior
const userPreferences = {
  logLevel: localStorage.getItem('logLevel') || 'info',
  showDebugInfo: localStorage.getItem('showDebugInfo') === 'true',
  compactMode: localStorage.getItem('compactMode') === 'true',
}
```

## 📊 Metrics & Monitoring

### **Code Quality Metrics**
- **Lines of Code**: Track total LOC and per-file averages
- **Cyclomatic Complexity**: Keep functions under complexity threshold
- **Code Duplication**: Monitor and eliminate duplicate code
- **Test Coverage**: Maintain adequate test coverage

### **Performance Metrics**
- **Bundle Size**: Monitor frontend bundle size
- **API Response Time**: Track backend response times
- **Memory Usage**: Monitor memory consumption
- **Startup Time**: Track application startup time

### **Maintenance Metrics**
- **Bug Rate**: Track bugs per feature
- **Code Review Time**: Monitor review duration
- **Refactoring Frequency**: Track how often code needs refactoring
- **Documentation Coverage**: Ensure adequate documentation

## 🚀 Implementation Strategy

### **Phase 1: Immediate Cleanup**
1. Remove unused imports and variables
2. Eliminate commented-out code
3. Consolidate duplicate functions
4. Simplify complex conditionals

### **Phase 2: Structural Improvements**
1. Refactor large functions into smaller ones
2. Extract common patterns into utilities
3. Simplify component hierarchies
4. Optimize API client design

### **Phase 3: Architectural Optimization**
1. Review and simplify middleware
2. Optimize database queries
3. Streamline configuration management
4. Implement feature flags

### **Phase 4: Maintenance & Monitoring**
1. Set up automated code quality checks
2. Implement performance monitoring
3. Create code review guidelines
4. Establish refactoring processes

---

**Remember**: The best code is often the code you don't write. Always ask "Can this be simpler?" before implementing a solution.
