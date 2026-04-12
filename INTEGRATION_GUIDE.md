# Scorelytics Full Stack Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                     Port 5173 (dev)                          │
│  ├─ React Components                                         │
│  ├─ Tailwind CSS Styling                                    │
│  └─ API Client (Axios with VITE_API_BASE_URL)              │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP Requests to /api/*
             │ (VITE_API_BASE_URL)
             ↓
┌─────────────────────────────────────────────────────────────┐
│                 Java Backend (Spring Boot 3.2.2)            │
│                     Port 8080                                │
│  ├─ REST API Endpoints (/api/*)                             │
│  ├─ Authentication (JWT)                                    │
│  ├─ Business Logic (Services)                               │
│  ├─ Data Access (Spring Data MongoDB)                       │
│  └─ CORS Configuration (allows port 3000, 5173)            │
└────────────┬────────────────────────────────────────────────┘
             │ MongoDB Operations
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                  │
│            Cluster: javaproject                              │
│            Database: scorelytics                             │
└─────────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Backend (.env) - Sensitive Data Only
Location: `java-backend/` root
```env
# MongoDB Connection - SENSITIVE
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/scorelytics?retryWrites=true&w=majority

# JWT Signing Secret - SENSITIVE
JWT_SECRET=your_long_random_secret_key

# Server Configuration
SERVER_PORT=8080

# Logging
LOG_LEVEL=DEBUG
```

**Storage:** Backend directory only, NOT in root .gitignore

### Frontend (.env) - Safe to Share
Location: `scorelytics/` root (frontend directory)
```env
# Backend API URL - PUBLIC
VITE_API_BASE_URL=http://localhost:8080/api

# Third-party API Keys - SEMI-PUBLIC
GEMINI_API_KEY=your_public_api_key

# Do not put MongoDB credentials in the frontend.
```

**Storage:** Frontend directory, in .gitignore

## Step-by-Step Integration

### 1. Start Backend
```bash
cd java-backend
mvn clean package
java -jar target/aptitude-system-0.0.1-SNAPSHOT.jar
```
- Backend starts on `http://localhost:8080`
- Loads `.env` variables via EnvironmentConfig.java
- Connects to MongoDB Atlas
- CORS enabled for frontend origins

### 2. Start Frontend
```bash
cd scorelytics
npm install
npm run dev
```
- Frontend starts on `http://localhost:5173`
- Vite dev server with HMR enabled
- Express server on `http://localhost:3000` (if server.ts runs)
- API Client reads `VITE_API_BASE_URL` from .env

### 3. Test API Connection
```bash
# Browser console (Frontend is running)
fetch('http://localhost:8080/api/tests')
  .then(r => r.json())
  .then(data => console.log(data))
```

## API Contract

### Request Example
```typescript
// Frontend API Request Flow
const response = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

### Request Headers (Automatically Added)
```
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

## Authentication Flow

### 1. User Registration
```
User Register Form (React)
    ↓
AuthService.register(name, email, password)
    ↓
POST /api/auth/register
    ↓
Backend: Check email not exists
Backend: Hash password with BCrypt
Backend: Create user in MongoDB
Backend: Generate JWT token
    ↓
Response: { token, profile }
    ↓
localStorage.setItem("scorelytics_token", token)
    ↓
Redirect to Dashboard
```

### 2. User Login
```
User Login Form (React)
    ↓
AuthService.login(email, password)
    ↓
POST /api/auth/login
    ↓
Backend: Find user by email
Backend: Compare password with BCrypt
Backend: Generate JWT token
    ↓
Response: { token, profile }
    ↓
localStorage.setItem("scorelytics_token", token)
    ↓
API Client auto-includes Authorization header
```

### 3. Authenticated API Requests
```
AuthService.getCurrentUser()
    ↓
GET /api/auth/me
    ↓
Request includes: Authorization: Bearer <TOKEN>
    ↓
Backend: Validate JWT token
Backend: Extract user from token
Backend: Return user profile
    ↓
Response: User profile object
```

## Data Models & API Endpoints

### User Model
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",  // BCrypt hash
  "role": "USER"
}
```

**Endpoints:**
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/me` - Get current user
- `GET /api/users/{id}` - Get user profile
- `PATCH /api/users/{id}` - Update user

### Test Model
```json
{
  "_id": "507f1f77bcf86cd799439022",
  "title": "Quantitative Aptitude",
  "description": "Test your math skills",
  "questionIds": ["507f1f77bcf86cd799439033", "507f1f77bcf86cd799439034"],
  "duration": 60,
  "passingScore": 60,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Endpoints:**
- `GET /api/tests` - List all tests
- `GET /api/tests/{id}` - Get test details
- `POST /api/tests` - Create test (admin)
- `DELETE /api/tests/{id}` - Delete test (admin)

### Question Model
```json
{
  "_id": "507f1f77bcf86cd799439033",
  "text": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "category": "Quant",
  "difficulty": "EASY"
}
```

**Endpoints:**
- `GET /api/questions` - List all questions
- `POST /api/questions` - Create question (admin)
- `PATCH /api/questions/{id}` - Update question (admin)
- `DELETE /api/questions/{id}` - Delete question (admin)

### TestResult Model
```json
{
  "_id": "507f1f77bcf86cd799439044",
  "userId": "507f1f77bcf86cd799439011",
  "testId": "507f1f77bcf86cd799439022",
  "testTitle": "Quantitative Aptitude",
  "score": 45,
  "totalQuestions": 50,
  "accuracy": 90.0,
  "subjectWise": {
    "Quant": 15,
    "Reasoning": 15,
    "Verbal": 15
  },
  "weakAreas": ["Reasoning"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Endpoints:**
- `POST /api/results` - Submit test results
- `GET /api/results/user/{userId}` - Get user results
- `GET /api/results` - List all results (admin)

## Database Schema (MongoDB)

### Collections
```
scorelytics (database)
├── users (collection)
│   └─ user documents with roles, passwords
├── tests (collection)
│   └─ test configurations with question IDs
├── questions (collection)
│   └─ individual questions with answers
└── test_results (collection)
    └─ user test submissions and scores
```

### Relationships
```
User ─── (takes) ──→ Test ─── (contains) ──→ Question
  ↓
TestResult ──→ Records score and answers
```

## CORS Configuration

### What is Configured
Backend allows requests from:
- `http://localhost:3000` (Express/Node backend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8080` (Backend itself)

### Methods Allowed
- GET, POST, PUT, PATCH, DELETE, OPTIONS

### Headers Allowed
- All (`*`)

### Credentials
- Enabled (for cookies/JWT in Authorization header)

### Max Age
- 3600 seconds (1 hour)

## Frontend File Structure

```
scorelytics/
├── src/
│   ├── services/
│   │   ├── apiClient.ts          # Axios instance with VITE_API_BASE_URL
│   │   ├── authService.ts        # Auth endpoints (uses apiClient)
│   │   └── testService.ts        # Test/result repositories (uses apiClient)
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── TestList.tsx
│   │   └── TestTaker.tsx
│   ├── pages/
│   ├── types/
│   ├── context/
│   └── App.tsx
├── .env                          # Environment variables (in .gitignore)
├── .env.example                  # Template for .env
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## Development Workflow

### 1. Design Phase
- Plan API contracts
- Define data models
- Create database schema

### 2. Backend Development
```bash
cd java-backend
mvn spring-boot:run
```
- Develop REST endpoints
- Test with Postman/curl
- Ensure CORS is configured

### 3. Frontend Development
```bash
cd scorelytics
npm run dev
```
- Develop React components
- Integrate API services
- Test with actual backend

### 4. Integration Testing
- Test full authentication flow
- Test data submission
- Test error handling
- Test different user roles

### 5. Deployment
- Backend: `java -jar target/...jar`
- Frontend: `npm run build && npm run preview`
- Verify API URLs match deployment environment

## Troubleshooting Checklist

### Frontend Can't Connect to Backend
- [ ] Backend is running on port 8080
- [ ] `VITE_API_BASE_URL` is set correctly in .env
- [ ] Check browser DevTools > Network tab
- [ ] Verify CORS allowing frontend origin
- [ ] Check firewall isn't blocking requests

### API Requests Failing with 401
- [ ] Token might be expired
- [ ] Clear localStorage and re-login
- [ ] Check JWT_SECRET in backend .env
- [ ] Verify token format: `Bearer <token>`

### Database Connection Issues
- [ ] MongoDB Atlas cluster is running
- [ ] IP whitelist includes current machine
- [ ] `MONGODB_URI` is correct in backend .env
- [ ] Database username/password are correct
- [ ] Network connectivity to MongoDB

### CORS Errors in Console
- [ ] Check backend's SecurityConfig.java for corsConfigurationSource()
- [ ] Frontend origin must be in allowedOrigins list
- [ ] Verify `Access-Control-Allow-Origin` header in response

### Port Already in Use
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

## Performance Tips

### Frontend Optimization
- Use React.memo for expensive components
- Implement pagination for test lists
- Cache API responses in context/Redux
- Lazy load components with React.lazy

### Backend Optimization
- Add database indexes on frequently queried fields
- Implement pagination for list endpoints
- Cache JWT token validation
- Use connection pooling for MongoDB

### API Optimization
- Minimize JSON payload size
- Implement request compression (gzip)
- Use ETag for caching
- Implement request rate limiting

## Security Best Practices

### Frontend
- ✅ Store JWT in localStorage (or sessionStorage)
- ✅ Include JWT in Authorization header
- ✅ Clear token on 401 response
- ✅ Don't log sensitive data

### Backend
- ✅ Hash passwords with BCrypt
- ✅ Validate JWT on every request
- ✅ Sanitize user input
- ✅ Use HTTPS in production
- ✅ Set secure CORS policy
- ✅ Implement rate limiting

### Environment Variables
- ✅ Backend .env: has MongoDB URI and JWT secret
- ✅ Frontend .env: only has API URL and public keys
- ✅ Both: in .gitignore
- ✅ Production: use deployment platform secrets

## Next Steps

1. **Start Backend**: Follow [Java Backend Setup](java-backend/ENV_SETUP.md)
2. **Start Frontend**: Follow [Frontend Setup](FRONTEND_SETUP.md)
3. **Test Integration**: Use browser DevTools to verify API calls
4. **Deploy**: Set up CI/CD pipeline
5. **Monitor**: Implement logging and error tracking

