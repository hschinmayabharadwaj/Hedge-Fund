# Frontend Application

Modern Next.js 14 frontend application with real-time market monitoring, reinforcement learning predictions, and secure authentication.

## 🚀 Features

- **Real-time Market Monitoring** - Live data streaming with WebSocket
- **AI-Powered Predictions** - Reinforcement learning agent integration
- **Secure Authentication** - Integration with secure backend API
- **Responsive Design** - TailwindCSS with modern UI components
- **Dark Mode Support** - System-aware theme switching
- **Data Visualization** - Interactive charts and graphs
- **State Management** - Zustand for efficient state handling

## 🛠️ Technology Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - Latest React features
- **TypeScript/JavaScript** - Type-safe development

### Styling
- **TailwindCSS 3** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom Components** - Reusable UI components

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Built-in state management

### Data Fetching
- **SWR** - React Hooks for data fetching
- **Axios** - HTTP client
- **WebSocket** - Real-time data streaming

### Database (if applicable)
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Primary database



## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn or pnpm
- Backend API running (see ../backend)

### Installation

1. **Navigate to frontend directory**
```bash
cd "D:\pgsql fullstack\frontend"
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**
```bash
# Copy environment template
cp .env.example .env

# Update .env with your configuration
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open browser**
```
http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Database (if using Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (if applicable)
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_RL_AGENT=true
```

### Next.js Configuration

The `next.config.js` file contains:
- Webpack configuration
- API proxy settings
- Image optimization
- Environment variables

### TailwindCSS Configuration

The `tailwind.config.js` includes:
- Custom colors
- Custom fonts
- Extended utilities
- Plugin configuration

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Database (if using Prisma)
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma studio    # Open Prisma Studio
```

## 🎨 Components

### UI Components (`src/components/ui/`)
- Buttons, Inputs, Cards
- Modals, Dropdowns, Tooltips
- Forms, Tables, Lists

### Layout Components (`src/components/layout/`)
- Header, Footer, Sidebar
- Navigation, Breadcrumbs
- Page layouts

### Feature Components
- **MarketChart** - Real-time market data visualization
- **MarketMonitor** - Live market monitoring dashboard
- **PredictionPanel** - AI prediction display
- **PortfolioSummary** - Portfolio overview
- **UnifiedFeedTable** - Data feed table

## 🔐 Authentication

### Backend Integration

The frontend connects to the secure FastAPI backend:

```javascript
import { login, logout, register } from '@/lib/auth';

// Login
const { access_token } = await login(username, password, mfaToken);

// Register
await register({ username, email, password });

// Logout
await logout();
```

### Protected Routes

Use middleware or HOC to protect routes:

```javascript
// In page.js or layout.js
import { requireAuth } from '@/lib/auth';

export default async function ProtectedPage() {
  await requireAuth(); // Redirects if not authenticated
  // Page content
}
```

## 📊 State Management

### Zustand Store

```javascript
import { useMarketStore } from '@/store/market-store';

function MyComponent() {
  const { data, updateData } = useMarketStore();
  
  return (
    <div>{data.price}</div>
  );
}
```

## 🌐 API Integration

### REST API

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get users
const { data } = await api.get('/api/v1/users');

// Send message
await api.post('/api/v1/messages/send', {
  topic: 'events',
  value: { data: 'example' }
});
```

### WebSocket

```javascript
import { connectWebSocket } from '@/lib/websocket';

const ws = connectWebSocket();

ws.on('market_update', (data) => {
  console.log('Market update:', data);
});
```

## 🎯 Features

### Real-time Market Monitoring
- Live price updates via WebSocket
- Historical data visualization
- Custom indicators and alerts

### AI Predictions
- Reinforcement learning agent integration
- Price prediction display
- Confidence intervals
- Model performance metrics

### User Dashboard
- Portfolio overview
- Transaction history
- Account settings
- Security settings (MFA)

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t frontend:latest .

# Run container
docker run -p 3000:3000 frontend:latest
```

### Manual Build

```bash
# Build
npm run build

# Start production server
npm start
```

## 🔒 Security

### Best Practices
- ✅ Environment variables for sensitive data
- ✅ HTTPS in production
- ✅ CSP headers configured
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure authentication flow
- ✅ Token storage in httpOnly cookies

### Environment Security
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly
- Use strong authentication tokens

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Performance

### Optimization Techniques
- Code splitting with Next.js
- Image optimization
- Font optimization
- Lazy loading components
- Memoization with React.memo
- SWR for data caching

### Build Optimization
- Webpack bundle analysis
- Tree shaking
- Minification
- Compression (gzip/brotli)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🤝 Integration with Backend

### Backend API Endpoints

The frontend connects to these backend endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/users` - List users
- `POST /api/v1/messages/send` - Send Kafka message
- `POST /api/v1/search` - Search data

### WebSocket Events

- `connect` - Connection established
- `disconnect` - Connection lost
- `market_update` - Real-time market data
- `prediction_update` - AI prediction update
- `error` - Error message

## 📝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License

## 🆘 Support

For issues and questions:
- Frontend Issues: Create GitHub issue
- Backend Integration: See backend documentation
- General Support: support@yourdomain.com

## 🔗 Related Projects

- **Backend API**: `../backend/` - Secure FastAPI backend
- **Documentation**: See backend documentation for API reference

---

**Next Steps:**
1. Configure environment variables
2. Connect to backend API
3. Start development server
4. Begin building features

For backend setup, see: `../backend/README.md`
