# Redis Setup Guide for Exam AI

## Overview
This project now uses Redis for server-side caching to improve performance and ensure data persistence. Redis caches generated visual analysis data for 1 hour by default.

## Installation Options

### Option 1: Install Redis Locally (Recommended for Development)

#### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Windows:
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Install and start the Redis service

### Option 2: Use Docker (Alternative)
```bash
docker run -d -p 6379:6379 --name redis-cache redis:alpine
```

### Option 3: Use Cloud Redis (Production)
- **Redis Cloud**: https://redis.com/try-free/
- **AWS ElastiCache**: https://aws.amazon.com/elasticache/redis/
- **Google Cloud Memorystore**: https://cloud.google.com/memorystore

## Configuration

### Environment Variables
Add to your `.env` file:
```env
REDIS_URL=redis://localhost:6379
```

### Default Configuration
- **Host**: localhost
- **Port**: 6379
- **Cache TTL**: 3600 seconds (1 hour)
- **Cache Pattern**: `visual_data:*`

## Testing Redis Connection

### Check if Redis is running:
```bash
redis-cli ping
```
Should return: `PONG`

### Test cache functionality:
1. Start the server: `npm start`
2. Open http://localhost:3000/visual-analyzer.html
3. Generate some data
4. Check cache status using the "Cache Status" button

## Cache Management

### API Endpoints
- `POST /api/clear-cache` - Clear specific or all cached data
- `GET /api/cache-status` - Get cache status and information

### Cache Keys Format
- Visual data: `visual_data:{examType}:{subject}`
- Example: `visual_data:SAT:Math`

## Fallback Behavior
If Redis is not available:
- The application will continue to work
- Data will be generated fresh each time
- Session storage will be used as a backup
- No functionality will be lost

## Performance Benefits
- **Faster Response Times**: Cached data loads instantly
- **Reduced API Calls**: Less OpenAI API usage
- **Better User Experience**: Consistent data across sessions
- **Cost Optimization**: Fewer API requests

## Monitoring
Check the server console for Redis connection status:
- ✅ Redis connected successfully
- ⚠️ Redis connection failed
- ⚠️ Redis not available

## Troubleshooting

### Common Issues:
1. **Redis connection failed**
   - Ensure Redis is running: `redis-cli ping`
   - Check port 6379 is not blocked
   - Verify Redis service is started

2. **Cache not working**
   - Check server logs for Redis errors
   - Verify REDIS_URL environment variable
   - Test with `redis-cli` directly

3. **Performance issues**
   - Monitor Redis memory usage
   - Check cache hit/miss ratios
   - Consider increasing cache TTL

## Production Considerations
- Use Redis Cloud or managed Redis service
- Set up Redis clustering for high availability
- Monitor Redis performance and memory usage
- Implement cache warming strategies
- Set appropriate TTL values based on data freshness requirements 