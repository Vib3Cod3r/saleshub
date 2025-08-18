# AI-Driven CRM Sales and Marketing Database

A comprehensive, enterprise-grade Customer Relationship Management (CRM) database schema designed for sales and marketing organizations with AI capabilities. This schema provides the foundation for building CRM systems similar to Salesforce or HubSpot, with particular emphasis on AI-driven insights and comprehensive tracking.

## 🚀 Features

### Core CRM Functionality
- **Contact & Company Management**: Comprehensive contact profiles with personal details, company associations, and relationship tracking
- **Lead Management**: Full lead lifecycle from prospecting to conversion with activity tracking
- **Deal Pipeline**: Complete sales pipeline management with stage tracking and history
- **Task & Workflow Management**: Sales process automation and task tracking
- **Content Management**: Marketing asset tracking and engagement analytics
- **Communication Tracking**: All customer interactions recorded and analyzed

### AI & Analytics Ready
- **Company Research**: AI-generated company insights and research storage
- **Lead Scoring**: Automated lead qualification and scoring
- **Activity Tracking**: Comprehensive touchpoint tracking for lead nurturing
- **Custom Fields**: Extensible schema for organization-specific data
- **Audit Logging**: Complete change history for compliance and analytics

### Enterprise Features
- **Role-Based Access Control**: Flexible user roles and permissions
- **User Groups**: Team-based organization and collaboration
- **Social Media Integration**: Social profile tracking and engagement
- **External Integrations**: API-ready for third-party service connections
- **Multi-currency Support**: International business support
- **Advanced Address Management**: Comprehensive address handling with geocoding, validation, and standardization

## 🏗️ Database Schema Overview

### Core Entities

#### Users & Access Control
- **User**: Core user accounts with role-based permissions
- **UserRole**: Flexible role definitions with JSON-based permissions
- **UserGroup**: Team organization and collaboration groups
- **UserGroupMember**: Group membership management

#### Address Management
- **Address**: Centralized address storage with geographic coordinates and timezone support
- **AddressFormat**: Country-specific address formatting rules and validation patterns
- **AddressGeocoding**: Geographic coordinate data from multiple mapping providers
- **AddressValidation**: Address validation results from postal services
- **AddressStandardization**: Standardized address formats for consistency
- **AddressHistory**: Complete audit trail of address changes and updates
- **CompanyAddress**: Company address relationships supporting business, billing, head office, branch, warehouse, and shipping addresses
- **ContactAddress**: Contact address relationships supporting home, work, billing, and shipping addresses
- **LeadAddress**: Lead address relationships for prospect location tracking

#### Contact & Company Management
- **Contact**: Comprehensive contact profiles with personal and professional details
- **Company**: Company profiles with hierarchy support and AI research
- **CompanyResearch**: AI-generated company insights and research data
- **SocialProfile**: Social media profile tracking across platforms

#### Lead Management
- **Lead**: Prospect tracking with source attribution and scoring
- **LeadList**: Organized lead collections for campaigns and workflows
- **LeadActivity**: Comprehensive activity tracking for lead nurturing
- **LeadListMember**: Lead list membership management

#### Sales Pipeline
- **Deal**: Sales opportunity management with stage tracking
- **DealProduct**: Product line items within deals
- **DealStageHistory**: Complete stage change history for analytics

#### Content & Marketing
- **Content**: Marketing asset management across all media types
- **ContentInteraction**: Engagement tracking and analytics
- **Communication**: All customer communication records
- **CommunicationAttachment**: File attachment management

#### Workflow & Tasks
- **Workflow**: Sales process automation and workflow management
- **Task**: Individual task tracking with assignment and completion
- **Note**: Contextual notes and meeting records

#### Extensibility & Tracking
- **CustomField**: User-defined field definitions
- **CustomFieldValue**: Custom field data storage
- **AuditLog**: Complete change tracking and compliance
- **ExternalIntegration**: Third-party service integration management

## 🔧 Technical Implementation

### Database Requirements
- **Database**: PostgreSQL (recommended) or MySQL
- **ORM**: Prisma ORM with Node.js/TypeScript
- **API**: RESTful API with GraphQL support capability

### Key Design Principles
1. **Normalized Structure**: Proper database normalization for data integrity
2. **Flexible Relations**: Many-to-many relationships where appropriate
3. **Audit Trail**: Complete change tracking for compliance
4. **Extensibility**: Custom fields and user-defined extensions
5. **Performance**: Indexed fields for common queries
6. **Scalability**: Designed for enterprise-level data volumes
7. **Address Flexibility**: Comprehensive address management supporting multiple address types, geocoding, validation, and standardization

### AI Integration Points
- **CompanyResearch**: Store AI-generated company insights
- **LeadScoring**: AI-powered lead qualification
- **ContentRecommendation**: Track content engagement for AI learning
- **PredictiveAnalytics**: Historical data for AI model training
- **AddressIntelligence**: AI-powered address validation and geocoding

## 📊 Data Flow Examples

### Lead to Customer Journey
1. **Lead Creation**: Lead captured from website, event, or campaign
2. **Lead Scoring**: AI assigns lead score based on behavior and profile
3. **Lead Assignment**: Sales rep assigned based on territory or expertise
4. **Lead Nurturing**: Automated and manual follow-up activities
5. **Lead Conversion**: Lead converted to Contact and Company
6. **Deal Creation**: Sales opportunity created from converted lead
7. **Pipeline Management**: Deal progresses through sales stages
8. **Customer Onboarding**: Post-sale relationship management

### Content Marketing Workflow
1. **Content Creation**: Marketing team creates content assets
2. **Content Distribution**: Content shared across channels
3. **Engagement Tracking**: Monitor how prospects interact with content
4. **Lead Generation**: Capture leads from content engagement
5. **Lead Nurturing**: Follow up based on content interests
6. **Sales Conversion**: Convert engaged leads to customers

## 🏠 Advanced Address Management System

### Centralized Address Storage
The schema implements a sophisticated, enterprise-grade address management system that provides:

- **Single Source of Truth**: All addresses stored in one table with consistent formatting
- **Multiple Address Types**: Support for various address categories per entity
- **Geographic Intelligence**: Latitude/longitude coordinates and timezone support
- **Flexible Relationships**: Many-to-many relationships between entities and addresses
- **Address Validation**: Integration with postal services for address verification
- **Geocoding Support**: Multiple mapping provider integrations
- **Address Standardization**: Consistent formatting across all addresses
- **Complete History**: Track all address changes and updates

### Address Tables & Features

#### Core Address Table
```typescript
interface Address {
  id: string;
  type: AddressType;           // STREET, PO_BOX, SUITE, FLOOR, UNIT, BUILDING
  isPrimary: boolean;          // Primary address flag
  address1: string;            // Main address line
  address2?: string;           // Secondary address line (suite, unit, etc.)
  city: string;                // City
  state?: string;              // State/province
  zipCode?: string;            // Postal code
  country: string;             // Country
  latitude?: number;           // Geographic coordinates
  longitude?: number;          // Geographic coordinates
  timezone?: string;           // Timezone for location
  notes?: string;              // Additional address notes
  isVerified: boolean;         // Verification status
  verificationDate?: DateTime; // When verification was completed
}
```

#### Address Format Management
```typescript
interface AddressFormat {
  country: string;             // Country code
  format: string;              // Address format template
  required: string[];          // Required fields for this country
  optional: string[];          // Optional fields for this country
  postalCodeRegex?: string;    // Postal code validation regex
  stateList: string[];         // Valid states/provinces for this country
}
```

#### Address Geocoding
```typescript
interface AddressGeocoding {
  addressId: string;
  provider: GeocodingProvider; // GOOGLE_MAPS, MAPBOX, HERE_MAPS, etc.
  accuracy: GeocodingAccuracy; // ADDRESS, STREET, CITY, etc.
  confidence: number;          // 0-1 confidence score
  formattedAddress: string;    // Provider-formatted address
  components: Json;            // Structured address components
  metadata: Json;              // Provider-specific data
}
```

#### Address Validation
```typescript
interface AddressValidation {
  addressId: string;
  provider: ValidationProvider; // USPS, ROYAL_MAIL, CANADA_POST, etc.
  isValid: boolean;            // Validation result
  confidence: number;          // 0-1 confidence score
  suggestions: Json;           // Suggested corrections
  errors: string[];            // Validation error messages
  warnings: string[];          // Validation warnings
}
```

#### Address Standardization
```typescript
interface AddressStandardization {
  addressId: string;
  standardizedAddress: string; // Standardized format
  components: Json;            // Structured components
  quality: AddressQuality;     // UNKNOWN, POOR, FAIR, GOOD, EXCELLENT
  confidence: number;          // 0-1 confidence score
  standardizer: string;        // Service used
}
```

#### Address History Tracking
```typescript
interface AddressHistory {
  addressId: string;
  changeType: AddressChangeType; // CREATED, UPDATED, VERIFIED, VALIDATED, etc.
  oldValue?: string;            // Previous value
  newValue?: string;            // New value
  changedBy: string;            // Who made the change
  reason?: string;              // Reason for change
  metadata: Json;               // Additional context
}
```

### Address Types Supported

#### Company Addresses
- **BUSINESS**: Primary business location
- **BILLING**: Billing and invoicing address
- **HEAD_OFFICE**: Corporate headquarters
- **BRANCH**: Branch office locations
- **WAREHOUSE**: Storage and distribution centers
- **SHIPPING**: Shipping and receiving addresses

#### Contact Addresses
- **HOME**: Personal residence
- **WORK**: Professional workplace
- **BILLING**: Personal billing address
- **SHIPPING**: Preferred shipping address
- **OTHER**: Additional address types

#### Lead Addresses
- **Primary**: Main prospect location for targeting and communication

### Address Relationship Management

#### Company Address Relationships
```typescript
interface CompanyAddress {
  companyId: string;
  addressId: string;
  addressType: CompanyAddressType;
  isPrimary: boolean;
  startDate: DateTime;         // When this address became active
  endDate?: DateTime;          // When this address became inactive
  notes?: string;              // Additional context
}
```

#### Contact Address Relationships
```typescript
interface ContactAddress {
  contactId: string;
  addressId: string;
  isPrimary: boolean;
  addressType: ContactAddressType;
  startDate: DateTime;         // When this address became active
  endDate?: DateTime;          // When this address became inactive
  notes?: string;              // Additional context
}
```

#### Lead Address Relationships
```typescript
interface LeadAddress {
  leadId: string;
  addressId: string;
  isPrimary: boolean;
  startDate: DateTime;         // When this address became active
  endDate?: DateTime;          // When this address became inactive
  notes?: string;              // Additional context
}
```

### Address Intelligence Features

#### Geocoding Providers
- **Google Maps**: High accuracy, comprehensive coverage
- **Mapbox**: Cost-effective, good performance
- **HERE Maps**: Enterprise-focused, reliable
- **OpenStreetMap**: Free, community-driven
- **Custom**: Integration with internal mapping systems

#### Validation Providers
- **USPS**: United States Postal Service
- **Royal Mail**: United Kingdom postal service
- **Canada Post**: Canadian postal service
- **Australia Post**: Australian postal service
- **Custom**: Integration with other postal services

#### Geocoding Accuracy Levels
- **UNKNOWN**: Unable to determine accuracy
- **COUNTRY**: Country-level accuracy
- **REGION**: State/province-level accuracy
- **SUB_REGION**: County/district-level accuracy
- **TOWN**: City-level accuracy
- **POSTCODE**: Postal code-level accuracy
- **STREET**: Street-level accuracy
- **INTERSECTION**: Intersection-level accuracy
- **ADDRESS**: Building-level accuracy
- **PREMISE**: Property-level accuracy
- **SUBPREMISE**: Unit/room-level accuracy

### Benefits of Advanced Address Management System

1. **Data Consistency**: Standardized address format across all entities
2. **Geographic Analytics**: Location-based reporting and territory management
3. **Multi-location Support**: Companies can have multiple address types
4. **Address History**: Track address changes over time with full audit trail
5. **International Support**: Flexible country and timezone handling with country-specific formats
6. **Geocoding Ready**: Built-in support for mapping and location services
7. **Validation Integration**: Postal service integration for address verification
8. **Standardization**: Consistent address formatting across all systems
9. **Quality Metrics**: Confidence scores and accuracy levels for all address data
10. **Provider Flexibility**: Support for multiple geocoding and validation services

### Address Management Use Cases

#### Sales Territory Management
- Assign leads and contacts to sales reps based on geographic proximity
- Analyze sales performance by region and territory
- Optimize territory boundaries for maximum coverage

#### Marketing Campaigns
- Target prospects by location for regional campaigns
- Analyze campaign performance by geographic area
- Optimize marketing spend based on location data

#### Customer Service
- Route support tickets to appropriate regional teams
- Provide location-specific product recommendations
- Optimize service delivery based on customer location

#### Compliance & Reporting
- Track address changes for regulatory compliance
- Generate location-based reports for stakeholders
- Maintain audit trails for address modifications

## 🚀 Getting Started

### 1. Database Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.template .env
# Edit .env with your database connection string

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

### 2. Environment Configuration
```env
DATABASE_URL="postgresql://username:password@localhost:5432/saleshub_crm"
JWT_SECRET="your-jwt-secret"
SMTP_HOST="smtp.example.com"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

### 3. API Development
The schema supports building:
- **RESTful APIs** for all CRUD operations
- **GraphQL APIs** for complex data queries
- **Real-time updates** via WebSocket connections
- **Webhook integrations** for external service synchronization

## 🔒 Security & Compliance

### Data Protection
- **Encrypted Storage**: Sensitive data encryption at rest
- **Access Control**: Role-based permissions and data isolation
- **Audit Logging**: Complete change history for compliance
- **Data Retention**: Configurable data retention policies

### Compliance Features
- **GDPR Ready**: Data subject rights and consent management
- **SOC 2 Compatible**: Security and availability controls
- **HIPAA Compatible**: Healthcare data protection (with additional measures)
- **SOX Compliant**: Financial reporting compliance support

## 📈 Performance & Scaling

### Optimization Strategies
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Efficient Prisma queries with proper relations
- **Caching**: Redis integration for frequently accessed data
- **Pagination**: Efficient large dataset handling

### Scaling Considerations
- **Horizontal Scaling**: Database sharding and read replicas
- **Microservices**: API decomposition for specific domains
- **Event Streaming**: Asynchronous processing for high-volume operations
- **CDN Integration**: Content delivery optimization

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning Integration**: Predictive analytics and recommendations
- **Advanced Reporting**: Business intelligence and dashboard capabilities
- **Mobile Applications**: Native mobile apps for field sales
- **Voice Integration**: Voice-to-text and call transcription
- **Blockchain Integration**: Secure contract and transaction management

### AI Capabilities
- **Predictive Lead Scoring**: ML-based lead qualification
- **Content Optimization**: AI-driven content recommendations
- **Sales Forecasting**: Predictive revenue analytics
- **Customer Churn Prediction**: Early warning systems
- **Automated Follow-up**: Intelligent communication scheduling
- **Address Intelligence**: AI-powered address validation and geocoding

## 🤝 Contributing

This schema is designed to be a foundation for CRM development. Contributions are welcome:

1. **Schema Enhancements**: Additional entities and relationships
2. **Performance Optimizations**: Database and query improvements
3. **Documentation**: Better explanations and examples
4. **Integration Examples**: Sample implementations and use cases

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions:
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions for questions
- **Documentation**: Comprehensive inline documentation
- **Examples**: Sample implementations and use cases

---

**Built with ❤️ for modern sales and marketing teams**