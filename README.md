# TargetGrid - Event-Driven Lead Scoring System

A production-quality, event-driven lead scoring system built with modern web technologies. Process lead events asynchronously, calculate scores based on configurable rules, and provide real-time updates.

## 🚀 Features

- **Event-Driven Architecture**: Asynchronous event processing with queues
- **Multiple Ingestion Methods**: REST API, Webhooks, Batch Upload (CSV/JSON)
- **Real-Time Updates**: Live score updates via WebSocket
- **Idempotency**: Prevents duplicate event processing
- **Event Ordering**: Handles out-of-order events intelligently
- **Configurable Scoring**: Admin interface for managing scoring rules
- **Comprehensive Audit Trail**: Complete score history tracking
- **Modern UI**: Professional SaaS-grade interface

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **BullMQ** (Redis-based queue)
- **Prisma ORM** with MySQL
- **Socket.IO** for real-time updates
- **Winston** for logging

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Socket.IO Client** for real-time updates
- **Axios** for API communication

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd targetgrid
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:push
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📖 Documentation

For detailed setup instructions, architecture overview, and API documentation, see [Developer.md](Developer.md).

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Queue         │    │   Workers       │
                       │   (Redis)       │◄──►│   (BullMQ)      │
                       └─────────────────┘    └─────────────────┘
```

## 🔄 Event Flow

1. **Event Ingestion**: API receives events via REST, webhooks, or file upload
2. **Validation**: Events are validated and checked for duplicates
3. **Queue Processing**: Valid events are added to the processing queue
4. **Score Calculation**: Workers process events and calculate scores
5. **Real-Time Updates**: Score changes are broadcast via WebSocket
6. **Audit Trail**: All changes are logged in score history

## 📊 Default Scoring Rules

| Event Type    | Points | Description           |
|---------------|--------|-----------------------|
| PAGE_VIEW     | +5     | User views a page     |
| EMAIL_OPEN    | +10    | User opens an email   |
| FORM_SUBMIT   | +20    | User submits a form   |
| DEMO_REQUEST  | +50    | User requests a demo  |
| PURCHASE      | +100   | User makes a purchase |

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="mysql://root:password@localhost:3306/targetgrid"
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 📝 API Examples

### Create Event
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "lead_id": "user@example.com",
    "event_type": "PAGE_VIEW",
    "timestamp": "2024-01-06T10:00:00Z",
    "metadata": {"page": "/pricing"}
  }'
```

### Upload Events File
```bash
curl -X POST http://localhost:3001/api/events/upload \
  -F "file=@events.csv"
```

### Get Leaderboard
```bash
curl http://localhost:3001/api/leads/leaderboard?limit=10
```

## 🧪 Testing

### Sample CSV Format
```csv
event_id,lead_id,event_type,timestamp,metadata
550e8400-e29b-41d4-a716-446655440000,user@example.com,PAGE_VIEW,2024-01-06T10:00:00Z,"{""page"":""/pricing""}"
```

## 🚀 Production Deployment

1. **Build Applications**
   ```bash
   cd backend && npm run build
   cd frontend && npm run build
   ```

2. **Environment Setup**
   - Configure production database
   - Set up Redis cluster
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

3. **Process Management**
   ```bash
   pm2 start backend/dist/index.js --name "targetgrid-api"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Built with ❤️ for modern lead scoring needs**# target-grid
