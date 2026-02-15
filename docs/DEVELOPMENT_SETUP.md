# FastPay Development Setup Guide

This comprehensive guide covers setting up a complete FastPay development environment, including both frontend and backend components, database configuration, and development workflows.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Overview](#environment-overview)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Firebase Configuration](#firebase-configuration)
- [Database Setup](#database-setup)
- [Development Workflow](#development-workflow)
- [Common Issues](#common-issues)
- [Development Tools](#development-tools)

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Operating System** | Windows 10, macOS 10.15, Ubuntu 18.04 | Latest versions |
| **Node.js** | v18.0.0 | v20.0.0+ |
| **Python** | v3.9 | v3.11+ |
| **npm** | v9.0.0 | v10.0.0+ |
| **Git** | v2.30 | v2.40+ |
| **RAM** | 8GB | 16GB+ |
| **Storage** | 10GB free | 20GB+ free |

### Required Accounts

- **GitHub**: Access to FastPay repository
- **Firebase**: Firebase project with Realtime Database
- **Google Cloud**: For Gmail OAuth (optional)
- **SMS Gateway**: Account for SMS services (optional)

### Development Tools

- **IDE**: VS Code, PyCharm, or similar
- **Browser**: Chrome/Firefox with developer tools
- **Database Tool**: pgAdmin, DBeaver, or similar
- **API Client**: Postman, Insomnia, or similar

---

## Environment Overview

### Repository Structure

```
FASTPAY_BASE/
├── BACKEND/                    # Django REST API
│   ├── api/                   # API application
│   ├── fastpay_be/            # Django project settings
│   ├── requirements.txt       # Python dependencies
│   ├── manage.py             # Django management
│   └── .env.example          # Environment template
├── DASHBOARD_FASTPAY/          # React dashboard
│   ├── src/                  # Source code
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── .env.example          # Environment template
├── DASHBOARD_REDPAY/           # RedPay variant
├── scripts/                   # Utility scripts
└── docs/                     # Documentation
```

### Development Environments

| Environment | Purpose | Location |
|--------------|---------|----------|
| **Local** | Development and testing | Your machine |
| **Staging** | Pre-production testing | Server |
| **Production** | Live deployment | Server |

---

## Backend Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url> FASTPAY_BASE
cd FASTPAY_BASE
```

### 2. Python Environment

```bash
# Navigate to backend directory
cd BACKEND

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python --version
pip list
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment file
nano .env.local
```

**Environment Variables (.env.local)**:
```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=sqlite:///db.sqlite3
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/fastpay_dev

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id

# Gmail OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback/

# External Services (Optional)
BLACKSMS_AUTH_TOKEN=your-blacksms-token
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Development Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json
```

### 6. Start Development Server

```bash
# Start Django development server
python manage.py runserver

# Server will be available at http://127.0.0.1:8000/
# API endpoints at http://127.0.0.1:8000/api/
# Admin panel at http://127.0.0.1:8000/admin/
```

### 7. Verify Backend Setup

```bash
# Test API endpoint
curl http://127.0.0.1:8000/api/

# Test admin panel
# Open http://127.0.0.1:8000/admin/ in browser
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
# From FASTPAY_BASE directory
cd DASHBOARD_FASTPAY
```

### 2. Install Node Dependencies

```bash
# Install dependencies
npm install

# Verify installation
node --version
npm --version
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment file
nano .env.local
```

**Environment Variables (.env.local)**:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# External Services
VITE_BLACKSMS_AUTH_TOKEN=your-blacksms-token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=false
VITE_DEBUG_MODE=true

# Build Configuration
VITE_REDPAY_ONLY=false  # Set to true for RedPay variant
```

### 4. Start Development Server

```bash
# Start Vite development server
npm run dev

# Server will be available at http://localhost:5173/
```

### 5. Verify Frontend Setup

```bash
# Test build process
npm run build

# Test preview
npm run preview

# Run linting
npm run lint
```

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow project setup wizard
4. Enable Realtime Database
5. Configure security rules

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Under "Your apps", add a web app
3. Copy the configuration object
4. Update environment variables in both backend and frontend

### 3. Configure Security Rules

**Firebase Realtime Database Rules**:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "device": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.email.matches(/.*@fastpay\\.com$/)"
      }
    },
    "message": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "notification": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "contact": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "hertbit": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "fastpay": {
      ".read": "auth != null",
      ".write": "auth != null && auth.email.matches(/.*@fastpay\\.com$/)"
    }
  }
}
```

### 4. Test Firebase Connection

```bash
# Test backend Firebase connection
cd BACKEND
python manage.py shell
>>> from firebase_admin import db
>>> ref = db.reference('/test')
>>> ref.set({'message': 'Hello Firebase'})
>>> ref.get()
```

---

## Database Setup

### SQLite (Development)

```bash
# Default configuration
DATABASE_URL=sqlite:///db.sqlite3

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### PostgreSQL (Recommended for Production)

#### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (with Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download and install from postgresql.org
```

#### 2. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE fastpay_dev;
CREATE USER fastpay_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fastpay_dev TO fastpay_user;
\q
```

#### 3. Configure Django

```env
# In .env.local
DATABASE_URL=postgresql://fastpay_user:your_password@localhost:5432/fastpay_dev
```

#### 4. Install PostgreSQL Adapter

```bash
# Install psycopg2
pip install psycopg2-binary

# Or with PostgreSQL development libraries
# Ubuntu/Debian:
sudo apt install libpq-dev
pip install psycopg2-binary
```

#### 5. Run Migrations

```bash
python manage.py migrate
```

### Redis (Optional - for Caching)

#### 1. Install Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Download and install from redis.io
```

#### 2. Configure Django

```python
# In settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

---

## Development Workflow

### 1. Daily Development Routine

```bash
# Start backend server
cd BACKEND
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver

# In another terminal, start frontend server
cd DASHBOARD_FASTPAY
npm run dev
```

### 2. Code Quality Checks

```bash
# Backend linting and formatting
cd BACKEND
flake8 api/
black api/
isort api/

# Frontend linting and formatting
cd DASHBOARD_FASTPAY
npm run lint
npm run format
npm run type-check
```

### 3. Testing

```bash
# Backend tests
cd BACKEND
python manage.py test
python manage.py test api.tests.test_api

# Frontend tests
cd DASHBOARD_FASTPAY
npm test
npm run test:coverage
```

### 4. Database Migrations

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations
```

### 5. Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# (Review and merge)
```

---

## Common Issues

### Backend Issues

#### 1. Module Import Errors

```bash
# Problem: ModuleNotFoundError
# Solution: Check virtual environment activation
which python
pip list

# Reinstall dependencies if needed
pip install -r requirements.txt
```

#### 2. Database Connection Errors

```bash
# Problem: Can't connect to database
# Solution: Check database service status
# PostgreSQL
sudo systemctl status postgresql

# Redis
sudo systemctl status redis

# Check connection string
echo $DATABASE_URL
```

#### 3. Firebase Connection Issues

```bash
# Problem: Firebase connection failed
# Solution: Verify Firebase credentials
python manage.py shell
>>> from firebase_admin import credentials
>>> cred = credentials.Certificate('path/to/serviceAccountKey.json')
```

### Frontend Issues

#### 1. Node Version Compatibility

```bash
# Problem: Node version too old
# Solution: Use Node Version Manager (nvm)
nvm install 20
nvm use 20
nvm alias default 20
```

#### 2. Dependency Conflicts

```bash
# Problem: npm install fails
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
npm audit fix
```

#### 3. Build Errors

```bash
# Problem: TypeScript errors
# Solution: Check configuration
npm run type-check
# Fix individual errors in IDE
```

### Firebase Issues

#### 1. Security Rules Errors

```bash
# Problem: Permission denied
# Solution: Check Firebase rules
# Go to Firebase Console > Realtime Database > Rules
# Update rules to allow access
```

#### 2. Real-time Updates Not Working

```bash
# Problem: Data not updating in real-time
# Solution: Check Firebase listeners
# Open browser dev tools > Console
# Look for Firebase connection errors
```

---

## Development Tools

### VS Code Extensions

**Recommended Extensions**:
- Python (Microsoft)
- TypeScript and JavaScript Language Features (Microsoft)
- ES7+ React/Redux/React-Native snippets (dsznajder)
- Prettier - Code formatter (Prettier)
- ESLint (Microsoft)
- GitLens (GitKraken)
- Thunder Client (for API testing)

### VS Code Settings

```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./BACKEND/venv/bin/python",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Browser Developer Tools

**Chrome DevTools**:
- Elements: Inspect DOM and CSS
- Console: Debug JavaScript
- Network: Monitor API requests
- Application: Check localStorage and Firebase
- Performance: Profile application performance

### Database Tools

**Recommended Tools**:
- **pgAdmin**: PostgreSQL administration
- **DBeaver**: Universal database tool
- **TablePlus**: Modern database GUI
- **Redis Desktop Manager**: Redis GUI

### API Testing Tools

**Postman**:
- Import API collection from docs
- Set environment variables
- Test all endpoints
- Automate API testing

**Insomnia**:
- Lightweight REST client
- Environment management
- GraphQL support

---

## Performance Optimization

### Backend Optimization

```bash
# Enable Django debug toolbar (development only)
pip install django-debug-toolbar

# Add to settings.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### Frontend Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Enable source maps in development
# In vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true
  }
})
```

### Database Optimization

```bash
# Create database indexes
python manage.py dbshell
> CREATE INDEX idx_device_status ON api_device(status);
> CREATE INDEX idx_message_timestamp ON api_message(created_at);
```

---

## Debugging Tips

### Backend Debugging

```python
# Use Django debug toolbar
# Add breakpoints in code
import pdb; pdb.set_trace()

# Use print statements for quick debugging
print(f"Debug: {variable}")

# Check Django logs
python manage.py runserver --verbosity=2
```

### Frontend Debugging

```javascript
// Use console.log for debugging
console.log('Debug:', variable);

// Use debugger statement
debugger;

// Check React component state
// In React DevTools browser extension
```

### Firebase Debugging

```javascript
// Enable Firebase debug logging
firebase.database.enableLogging(true);

// Check Firebase connection
firebase.database().ref('.info/connected').on('value', (snap) => {
  console.log('Firebase connected:', snap.val());
});
```

---

## Next Steps

After completing the development setup:

1. **Review Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. **API Documentation**: Review [API_REFERENCE.md](API_REFERENCE.md)
3. **Frontend Components**: Explore component documentation
4. **Testing**: Write and run tests
5. **Deployment**: Learn deployment process

---

## Support

For development setup issues:

1. **Check logs**: Review application logs for errors
2. **Consult documentation**: Refer to relevant documentation
3. **Search issues**: Check GitHub issues for similar problems
4. **Contact team**: Reach out to development team

---

*This development setup guide should help you get a complete FastPay development environment running quickly. All setup steps have been tested on multiple platforms.*
