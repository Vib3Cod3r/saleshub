# Database Performance Optimization for 20K Scale

## Overview

This document outlines the performance optimizations implemented to support 20,000 contacts and 20,000 companies efficiently.

## Optimizations Implemented

### 1. Database Indexes

#### Contact Table Indexes
- `idx_contacts_company_id` - Company relationship queries
- `idx_contacts_tenant_id` - Multi-tenant data isolation
- `idx_contacts_owner_id` - User assignment queries
- `idx_contacts_name_search` - Name-based searches
- `idx_contacts_created_at` - Chronological queries
- `idx_contacts_email_opt_in` - Marketing queries
- `idx_contacts_sms_opt_in` - Marketing queries
- `idx_contacts_call_opt_in` - Marketing queries

#### Company Table Indexes
- `idx_companies_tenant_id` - Multi-tenant data isolation
- `idx_companies_name` - Company name searches
- `idx_companies_industry_id` - Industry filtering
- `idx_companies_size_id` - Company size filtering
- `idx_companies_assigned_to` - User assignment queries
- `idx_companies_created_at` - Chronological queries
- `idx_companies_employee_count` - Business intelligence
- `idx_companies_annual_revenue` - Business intelligence
- `idx_companies_lead_score` - Lead management
- `idx_companies_status` - Status filtering
- `idx_companies_priority` - Priority filtering

#### Polymorphic Contact Info Indexes
- `idx_email_addresses_entity_composite` - Email queries
- `idx_phone_numbers_entity_composite` - Phone queries
- `idx_addresses_entity_composite` - Address queries
- `idx_social_media_accounts_entity_composite` - Social media queries

#### Custom Fields Indexes
- `idx_custom_field_values_entity_composite` - Flexible schema queries
- `idx_custom_field_definitions_tenant_entity` - Field definition queries

### 2. Connection Pool Optimization

```go
// Optimized for 20K scale
sqlDB.SetMaxIdleConns(20)    // Increased from 10
sqlDB.SetMaxOpenConns(200)   // Increased from 100
sqlDB.SetConnMaxLifetime(time.Hour)
sqlDB.SetConnMaxIdleTime(30 * time.Minute)
```

### 3. Query Optimization

#### Optimized Query Patterns
- Proper preloading of relationships
- Efficient WHERE clauses with indexed fields
- Optimized pagination with proper offsets
- Composite indexes for common query patterns

#### Performance Monitoring
- Slow query detection (200ms threshold)
- Query execution time logging
- Performance metrics tracking
- Connection pool statistics

### 4. Scalable Field System

#### Extensible Fields
- Dynamic field creation for contacts and companies
- Support for multiple field types (text, number, date, etc.)
- Validation rules and constraints
- Multi-tenant field isolation

#### Field Types Supported
- Text, Textarea, Number, Decimal
- Date, DateTime, Boolean
- Dropdown, Radio, Checkbox
- URL, Email, Phone, Currency

## Running the Optimization

### Automatic Setup
```bash
# Run the optimization script
./scripts/optimize-database.sh
```

### Manual Setup
```bash
# Navigate to backend directory
cd backend

# Run the performance optimization migration
go run cmd/migrate/performance_optimization.go
```

## Performance Expectations

### Query Performance
- **Contact searches**: < 50ms for 20K contacts
- **Company searches**: < 50ms for 20K companies
- **Relationship queries**: < 100ms with preloaded data
- **Pagination**: < 200ms for large result sets

### Scalability Features
- **Horizontal scaling**: Multi-tenant architecture
- **Vertical scaling**: Optimized connection pooling
- **Field extensibility**: Dynamic schema without migrations
- **Performance monitoring**: Real-time query analysis

## Monitoring and Maintenance

### Performance Monitoring
```go
// Monitor slow queries
monitor := NewPerformanceMonitor(200 * time.Millisecond)
query := monitor.MonitorQuery(ctx, db, "GetContacts")
```

### Index Maintenance
```sql
-- Update table statistics periodically
ANALYZE contacts;
ANALYZE companies;
ANALYZE email_addresses;
ANALYZE phone_numbers;
```

### Connection Pool Monitoring
```go
// Log connection pool stats every 5 minutes
go logConnectionPoolStats(sqlDB)
```

## Best Practices

### Query Optimization
1. Always use indexed fields in WHERE clauses
2. Use proper preloading for relationships
3. Implement pagination for large datasets
4. Monitor slow queries and optimize them

### Field Management
1. Use extensible fields for new requirements
2. Validate field names and types
3. Implement proper constraints
4. Monitor field usage and performance

### Multi-Tenant Considerations
1. Always filter by tenant_id
2. Use tenant-specific indexes
3. Implement proper data isolation
4. Monitor per-tenant performance

## Troubleshooting

### Common Issues

#### Slow Queries
- Check if proper indexes exist
- Verify query execution plans
- Monitor connection pool usage
- Review slow query logs

#### Connection Pool Exhaustion
- Increase MaxOpenConns if needed
- Monitor connection usage patterns
- Implement connection pooling best practices
- Consider read replicas for heavy read loads

#### Memory Issues
- Monitor query result sizes
- Implement proper pagination
- Use streaming for large exports
- Optimize preloading strategies

### Performance Tuning

#### For Higher Loads
- Increase connection pool size
- Add read replicas
- Implement caching strategies
- Use database partitioning

#### For Larger Datasets
- Implement data archiving
- Use database partitioning
- Optimize index strategies
- Consider data warehousing

## Future Enhancements

### Planned Optimizations
1. **Caching Layer**: Redis integration for frequently accessed data
2. **Read Replicas**: Database read replicas for heavy read loads
3. **Data Archiving**: Automatic archiving of old data
4. **Advanced Analytics**: Business intelligence queries optimization

### Monitoring Enhancements
1. **Real-time Dashboards**: Performance monitoring dashboards
2. **Alerting**: Automated alerts for performance issues
3. **Trend Analysis**: Historical performance analysis
4. **Capacity Planning**: Predictive scaling recommendations

## Conclusion

The implemented optimizations provide a solid foundation for handling 20,000 contacts and 20,000 companies efficiently. The system is designed to be scalable, maintainable, and extensible for future growth.

Key benefits:
- ✅ **Fast queries** for large datasets
- ✅ **Scalable architecture** for growth
- ✅ **Extensible field system** for new requirements
- ✅ **Performance monitoring** for optimization
- ✅ **Multi-tenant support** for isolation
- ✅ **Connection pooling** for efficiency

The database is now ready for production use at scale!
