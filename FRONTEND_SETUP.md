# Frontend Setup Guide

## Overview
The Scorelytics frontend is a React 19 + Vite application that communicates with the Java Spring Boot backend running on port 8080.

## Prerequisites
- Node.js 18+ and npm installed
- Java backend running on `http://localhost:8080` (see [Java Backend Setup](../java-backend/ENV_SETUP.md))
- MongoDB Atlas connection (shared with backend)

## Environment Configuration

### Setup .env File

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
# Backend API Configuration
# Java Backend (Spring Boot) running on port 8080
VITE_API_BASE_URL=http://localhost:8080/api

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Important Notes
- **`VITE_API_BASE_URL`**: Points to the Java backend API on port 8080
- Do not put MongoDB credentials in the frontend `.env`. Keep DB creds in `java-backend/.env`.
- Keep `.env` file out of version control (it's in `.gitignore`)

## Installation & Running

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
This starts:
- Vite dev server on `http://localhost:5173`
- Java backend should be running separately at `http://localhost:8080/api`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## API Communication

### How It Works
1. **Frontend (React)** runs on port 5173 (dev) or 3000+ (prod)
2. **API Client** (`src/services/apiClient.ts`) uses `VITE_API_BASE_URL` environment variable
3. **Requests** go to `http://localhost:8080/api/` (configured via env variable)
4. **CORS** is enabled on Java backend to allow requests from port 3000 and 5173
5. **JWT Authentication** is included in all requests via interceptor

### API Endpoint Examples
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user (returns JWT token)
GET    /api/auth/me                - Get current user profile
GET    /api/tests                  - Get all available tests
POST   /api/results                - Submit test results
GET    /api/results/user/{userId}  - Get user's test results
```

## Services

### Authentication Service
Located at `src/services/authService.ts`
```typescript
import { AuthService } from '@/services/authService';

// Login
const user = await AuthService.login(email, password);

// Register
const user = await AuthService.register(name, email, password);

// Get current user
const user = await AuthService.getCurrentUser();

// Logout
AuthService.logout();
```

### Test Service
Located at `src/services/testService.ts`
```typescript
import { TestRepository, ResultRepository } from '@/services/testService';

// Get all tests
const tests = await TestRepository.getAll();

// Submit test results
const result = await ResultRepository.add(testResult);

// Get user results
const results = await ResultRepository.getByUserId(userId);
```

## Project Structure
```
src/
├── components/      # React components
├── pages/          # Page components
├── services/       # API services & repositories
│   ├── apiClient.ts        # Configured Axios instance (uses VITE_API_BASE_URL)
│   ├── authService.ts      # Authentication endpoints
│   ├── testService.ts      # Test & result repositories
├── types/          # TypeScript type definitions
├── context/        # React context for state management
├── lib/            # Utility functions
└── App.tsx         # Main app component
```

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Ensure Java backend is running on port 8080
2. Check `VITE_API_BASE_URL` matches backend address
3. Verify backend's `SecurityConfig.java` includes CORS configuration

### API Connection Fails
1. Check Java backend is running: `curl http://localhost:8080/api/tests`
2. Verify `.env` file has correct `VITE_API_BASE_URL`
3. Check Network tab in browser DevTools for failed requests

### JWT Token Issues
1. Clear browser localStorage: `localStorage.clear()`
2. Re-login to get new token
3. Check token expiration in backend `.env` (`JWT_EXPIRATION`)

### Port Already in Use
If port 3000 is already in use:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Environment-Specific Setup

### Local Development
```env
VITE_API_BASE_URL=http://localhost:8080/api
GEMINI_API_KEY=your_dev_key
```

### Staging
```env
VITE_API_BASE_URL=https://staging-api.scorelytics.com/api
GEMINI_API_KEY=your_staging_key
```

### Production
```env
VITE_API_BASE_URL=https://api.scorelytics.com/api
GEMINI_API_KEY=your_prod_key
```

## Deployment

### Deployment Checklist
- [ ] Backend (.env) has correct MongoDB URI
- [ ] Frontend (.env) has correct `VITE_API_BASE_URL`
- [ ] Frontend .env is NOT committed to git
- [ ] Build passes: `npm run build`
- [ ] Backend CORS allows frontend origin
- [ ] Environment variables are set in deployment platform
- [ ] API endpoints are tested before deploying

### Docker Deployment
See docker files in project root for containerized deployment.

## Additional Resources
- [Scorelytics Java Backend Setup](../java-backend/ENV_SETUP.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
