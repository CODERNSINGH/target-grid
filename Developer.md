# TargetGrid - Event-Driven Lead Scoring System

## Project Overview

TargetGrid is a production-quality, event-driven lead scoring system built with modern web technologies. The system processes lead events asynchronously through a queue-based architecture, calculates scores based on configurable rules, and provides real-time updates through WebSocket connections.

### Key Features

- **Event-Driven Architecture**: API → Queue → Worker → Score Engine → Database → WebSocket
- **Multiple Event Ingestion Methods**: REST API, Webhooks, Batch Upload (CSV/JSON)
- **Idempotency**: Prevents duplicate event processing using unique event IDs
- **Event Ordering**: Handles out-of-order events with timestamp-based processing
- **Real-Time Updates**: Live score updates via Socket.IO
- **Configurable Scoring**: Admin interface for managing scoring rules
- **Comprehensive Audit Trail**: Complete score history tracking
- **Modern UI**: Professional SaaS-grade interface with Tailwind CSS

## Architecture Overview

### Backend Architecture
```
src/
├── api/                 # API layer (not used, integrated into controllers)
├── controllers/         # HTTP request handlers
│   ├── leadController.js
│   ├── eventController.js
│   └── scoringController.js
├── services/           # Business logic layer
│   ├── leadService.js
│   ├── eventService.js
│   └── scoringService.js
├── queue/              # Queue management
│   └── connection.js
├── workers/            # Background job processors
│   └── eventWorker.js
├── models/             # Database models (Prisma handles this)
├── routes/             # Route definitions
│   ├── leadRoutes.js
│   ├── eventRoutes.js
│   ├── scoringRoutes.js
│   └── webhookRoutes.js
├── utils/              # Utility functions
│   ├── logger.js
│   ├── validation.js
│   └── database.js
├── middlewares/        # Express middlewares
│   ├── errorHandler.js
│   └── rateLimiter.js
├── constants/          # Application constants
│   └── index.js
└── prisma/            # Database schema and migrations
    └── schema.prisma
```

### Frontend Architecture
```
src/
├── components/         # Reusable UI components
│   ├── Sidebar.jsx
│   ├── LoadingSpinner.jsx
│   └── ErrorMessage.jsx
├── pages/             # Page components
│   ├── Dashboard.jsx
│   ├── Leads.jsx
│   ├── LeadDetail.jsx
│   ├── Leaderboard.jsx
│   ├── Events.jsx
│   └── ScoringRules.jsx
├── services/          # API communication layer
│   ├── api.js
│   ├── leadService.js
│   ├── eventService.js
│   ├── scoringService.js
│   └── socketService.js
├── hooks/             # Custom React hooks
│   ├── useLeads.js
│   └── useSocket.js
├── layouts/           # Layout components
│   └── MainLayout.jsx
└── routes/            # Route configuration (handled in App.jsx)
```
## Event Flow Diagram

```mermaid
graph TD
    A[Client/Webhook] --> B[API Endpoint]
    B --> C{Validate Event}
    C -->|Invalid| D[Return Error]
    C -->|Valid| E[Check Idempotency]
    E -->|Duplicate| F[Return Success - Already Processed]
    E -->|New| G[Create Event Record]
    G --> H[Add to Queue]
    H --> I[Event Worker]
    I --> J{Check Event Ordering}
    J -->|Out of Order| K[Skip Processing]
    J -->|Valid Order| L[Calculate Score]
    L --> M[Update Lead Score]
    M --> N[Create Score History]
    N --> O[Mark Event as Processed]
    O --> P[Emit Socket.IO Update]
    P --> Q[Frontend Receives Update]
```

## Idempotency Strategy

The system ensures idempotency through multiple layers:

1. **Database Constraint**: `event_id` field has a unique constraint
2. **Pre-processing Check**: Before creating an event, check if `event_id` already exists
3. **Safe Queue Handling**: Duplicate events are logged but don't cause failures
4. **Audit Trail**: All duplicate attempts are logged for monitoring

### Implementation Details
- Each event must have a globally unique `event_id` (UUID recommended)
- Duplicate events return success response but don't affect scores
- Duplicate attempts are logged with INFO level for monitoring
- Database constraint prevents race conditions

## Event Ordering Strategy

The system handles out-of-order events using timestamp-based processing:

### Approach: Timestamp-Based Filtering
- Each lead tracks `lastProcessedEventTime`
- Events are only processed if their timestamp is newer than the last processed event
- Older events are skipped but logged for audit purposes

### Benefits
- Prevents score corruption from delayed events
- Simple and deterministic logic
- Maintains data integrity

### Limitations
- Events arriving significantly late are ignored
- No retroactive score recalculation
- Relies on accurate client timestamps

### Alternative Approaches Considered
1. **Sequence Numbers**: More complex, requires client-side sequence management
2. **Event Buffering**: Would require complex windowing logic
3. **Full Reprocessing**: Too expensive for production use

## Database Design

### Core Tables

#### leads
- `id`: Primary key (UUID)
- `email`: Unique identifier for leads
- `currentScore`: Current calculated score
- `maxScore`: Maximum allowed score (default: 1000)
- `lastProcessedEventTime`: Timestamp of last processed event
- Personal information fields (firstName, lastName, company, phone)

#### events
- `id`: Primary key (UUID)
- `eventId`: Unique event identifier for idempotency
- `leadId`: Foreign key to leads table
- `eventType`: Enum (PAGE_VIEW, EMAIL_OPEN, etc.)
- `timestamp`: When the event occurred
- `processed`: Boolean flag for processing status
- `metadata`: JSON field for additional event data

#### score_history
- `id`: Primary key (UUID)
- `leadId`: Foreign key to leads table
- `previousScore`: Score before this change
- `newScore`: Score after this change
- `eventId`: Reference to the event that caused this change
- `eventType`: Type of event that caused this change
- `reason`: Human-readable reason for the score change
- `timestamp`: When the score change occurred

#### scoring_rules
- `id`: Primary key (UUID)
- `eventType`: Unique event type identifier
- `points`: Points awarded for this event type
- `enabled`: Whether this rule is active
- `description`: Human-readable description

### Indexes
- `events.eventId` (unique)
- `events.leadId`
- `events.timestamp`
- `events.processed`
- `score_history.leadId`
- `score_history.timestamp`

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations (for production)
   npm run db:migrate
   ```

4. **Start Services**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Set VITE_API_URL to your backend URL
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Required Services

1. **MySQL Database**
   - Create database: `targetgrid`
   - User with full permissions
   - Connection string format: `mysql://user:password@host:port/database`

2. **Redis Server**
   - Default configuration works for development
   - For production, configure persistence and security
   - Connection string format: `redis://host:port`

## How to Run

### Development Mode

1. **Start Backend Services**
   ```bash
   # Terminal 1: Start MySQL (if not running as service)
   mysql.server start
   
   # Terminal 2: Start Redis (if not running as service)
   redis-server
   
   # Terminal 3: Start Backend
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   # Terminal 4: Start Frontend
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

### Production Mode

1. **Build Applications**
   ```bash
   # Build backend
   cd backend
   npm run build
   
   # Build frontend
   cd frontend
   npm run build
   ```

2. **Deploy with Process Manager**
   ```bash
   # Using PM2
   pm2 start backend/dist/index.js --name "targetgrid-api"
   
   # Serve frontend with nginx or similar
   ```

## API Endpoints

### Lead Management
- `GET /api/leads` - List leads with pagination and search
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads` - Create new lead
- `GET /api/leads/leaderboard` - Get top performers
- `GET /api/leads/:id/score-history` - Get lead's score history

### Event Management
- `POST /api/events` - Create single event
- `POST /api/events/batch` - Create multiple events
- `POST /api/events/upload` - Upload events file (CSV/JSON)
- `GET /api/events/lead/:leadId` - Get events for a lead

### Scoring Rules
- `GET /api/scoring-rules` - List all scoring rules
- `POST /api/scoring-rules` - Create new scoring rule
- `PUT /api/scoring-rules/:id` - Update scoring rule

### Webhooks
- `POST /webhooks/events` - Webhook endpoint for external systems

## Known Limitations

1. **Event Ordering**: Late-arriving events are discarded rather than processed
2. **Score Recalculation**: No mechanism to recalculate historical scores when rules change
3. **Bulk Operations**: Large batch uploads may timeout (current limit: 1000 events)
4. **Real-time Scaling**: Socket.IO connections are not clustered
5. **Database Transactions**: Some operations could benefit from more granular transaction boundaries
6. **Rate Limiting**: Basic rate limiting implemented, may need tuning for high-volume scenarios

## Possible Future Improvements

### Short Term
1. **Enhanced Event Ordering**: Implement event buffering with configurable time windows
2. **Batch Processing Optimization**: Stream processing for large file uploads
3. **Advanced Filtering**: More sophisticated lead filtering and search capabilities
4. **Export Functionality**: CSV/PDF export for reports and data analysis
5. **Email Notifications**: Alert system for score thresholds and milestones

### Medium Term
1. **Score Recalculation Engine**: Ability to retroactively apply rule changes
2. **Advanced Analytics**: Trend analysis, conversion funnels, cohort analysis
3. **A/B Testing**: Multiple scoring rule sets for experimentation
4. **Integration APIs**: Pre-built connectors for popular CRM and marketing tools
5. **Advanced Security**: API authentication, role-based access control

### Long Term
1. **Machine Learning**: Predictive scoring based on historical patterns
2. **Multi-tenant Architecture**: Support for multiple organizations
3. **Advanced Workflow Engine**: Complex scoring rules with conditions and triggers
4. **Real-time Streaming**: Apache Kafka integration for high-volume event processing
5. **Microservices Architecture**: Split into specialized services for better scalability

## Performance Considerations

### Current Optimizations
- Database indexes on frequently queried fields
- Connection pooling for database and Redis
- Efficient pagination for large datasets
- Background job processing to avoid blocking API requests

### Scaling Recommendations
1. **Database**: Read replicas for analytics queries
2. **Queue**: Redis Cluster for high availability
3. **API**: Load balancer with multiple backend instances
4. **Frontend**: CDN for static assets
5. **Monitoring**: APM tools for performance tracking

## Security Considerations

### Current Implementation
- Input validation using Joi schemas
- SQL injection prevention via Prisma ORM
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js for security headers

### Production Recommendations
1. **Authentication**: Implement JWT or OAuth2
2. **Authorization**: Role-based access control
3. **HTTPS**: SSL/TLS encryption for all communications
4. **API Keys**: Secure webhook endpoints
5. **Audit Logging**: Comprehensive security event logging
6. **Data Encryption**: Encrypt sensitive data at rest

## Monitoring and Observability

### Logging
- Structured logging with Winston
- Different log levels for development and production
- Request/response logging for API endpoints
- Error tracking with stack traces

### Metrics (Recommended)
- API response times and error rates
- Queue processing metrics
- Database query performance
- Real-time connection counts

### Health Checks
- Database connectivity
- Redis connectivity
- Queue worker status
- API endpoint availability

---

## Support and Maintenance

For questions, issues, or contributions, please refer to the project repository or contact the development team.

**Built with ❤️ for modern lead scoring needs**