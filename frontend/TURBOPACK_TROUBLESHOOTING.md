# Turbopack Troubleshooting Guide

## Issue: Missing Turbopack Runtime Module

### Problem
When starting the development server with Turbopack, you may encounter this error:
```
Cannot find module '../chunks/ssr/[turbopack]_runtime.js'
```

### Root Cause
This is a known issue with Next.js 15 and Turbopack where the runtime module fails to generate properly, often due to:
1. Corrupted build cache
2. Incompatible Turbopack configuration
3. Missing dependencies
4. File system permission issues

### Solution

#### Immediate Fix (Recommended)
1. **Stop the development server** if it's running
2. **Clear the build cache**:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```
3. **Start without Turbopack**:
   ```bash
   npm run dev
   ```

#### Alternative: Use the Development Script
```bash
# Clean and restart
./scripts/dev-setup.sh restart

# Or start fresh
./scripts/dev-setup.sh clean
./scripts/dev-setup.sh start
```

### Prevention

#### 1. Use Stable Development Mode
- Default development mode (without Turbopack) is more stable
- Use `npm run dev` instead of `npm run dev:turbo`

#### 2. Regular Cache Cleaning
- Clear cache weekly or when issues arise
- Use `./scripts/dev-setup.sh clean` for thorough cleaning

#### 3. Monitor for Updates
- Check Next.js updates for Turbopack stability improvements
- Monitor GitHub issues for Next.js Turbopack problems

### When to Use Turbopack

Turbopack is still experimental and should be used with caution:

#### ✅ Good for:
- Testing new features
- Performance benchmarking
- Development when stable

#### ❌ Avoid when:
- Working on critical features
- Debugging complex issues
- Production-like development

### Configuration

The current `next.config.ts` includes Turbopack configuration for when you want to use it:

```typescript
experimental: {
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
},
```

### Troubleshooting Commands

```bash
# Check development environment status
./scripts/dev-setup.sh status

# Clean everything and reinstall
./scripts/dev-setup.sh clean
npm install
./scripts/dev-setup.sh start

# If issues persist, try with a fresh clone
git clone <repository>
cd frontend
npm install
./scripts/dev-setup.sh start
```

### Known Issues

1. **File watching issues**: Turbopack may not detect file changes properly
2. **Hot reload failures**: Sometimes requires manual refresh
3. **Memory usage**: Higher memory consumption than webpack
4. **Plugin compatibility**: Some webpack plugins may not work

### Reporting Issues

If you encounter persistent Turbopack issues:

1. Check the [Next.js GitHub issues](https://github.com/vercel/next.js/issues)
2. Search for similar Turbopack-related problems
3. Report new issues with:
   - Next.js version
   - Node.js version
   - Operating system
   - Steps to reproduce
   - Error logs

### Fallback Strategy

Always have a fallback development strategy:
1. Use webpack (default) for stable development
2. Use Turbopack only for testing
3. Keep both configurations working
4. Document any workarounds needed
