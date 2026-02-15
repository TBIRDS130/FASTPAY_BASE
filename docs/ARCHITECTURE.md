# FastPay System Architecture

This document provides a comprehensive overview of the FastPay system architecture, including component interactions, data flows, technology stack, and deployment architecture.

## 📋 Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Overview](#component-overview)
- [Data Flow Architecture](#data-flow-architecture)
- [Technology Stack](#technology-stack)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Communication Patterns](#communication-patterns)
- [Scalability Considerations](#scalability-considerations)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[FastPay APK<br/>Android Devices]
        B[Web Dashboard<br/>React/TypeScript]
        C[Admin Panel<br/>Django Admin]
    end
    
    subgraph "API Layer"
        D[Django REST API<br/>Backend Server]
        E[Firebase SDK<br/>Real-time Client]
    end
    
    subgraph "Data Layer"
        F[Firebase Realtime DB<br/>Real-time Data]
        G[PostgreSQL/SQLite<br/>Persistent Data]
        H[Redis<br/>Cache & Queue]
    end
    
    subgraph "External Services"
        I[Gmail API<br/>OAuth Integration]
        J[SMS Gateway<br/>Message Services]
        K[Telegram API<br/>Notifications]
    end
    
    A --> F
    B --> D
    B --> F
    C --> D
    D --> G
    D --> H
    D --> I
    D --> J
    D --> K
    E --> F
```

### System Components

| Layer | Components | Responsibility |
|-------|------------|----------------|
| **Client** | APK, Dashboard, Admin | User interface and device control |
| **API** | Django REST, Firebase SDK | Business logic and data access |
| **Data** | Firebase, PostgreSQL, Redis | Real-time and persistent storage |
| **External** | Gmail, SMS, Telegram | Third-party integrations |

---

## Component Overview

### 1. FastPay APK (Android Application)

**Technology**: Java/Kotlin, Android SDK

**Responsibilities**:
- Execute remote commands from dashboard
- Collect and sync SMS/notifications/contacts
- Maintain real-time connection to Firebase
- Handle device authentication and security
- Report device status and heartbeat

**Key Features**:
- **Command Execution**: 31 remote commands for device control
- **Data Collection**: Real-time SMS, notification, contact sync
- **Heartbeat System**: Lightweight status reporting
- **Security**: Encrypted communication and authentication

### 2. FastPay Dashboard (Web Application)

**Technology**: React 19.2.0, TypeScript, Vite, Tailwind CSS

**Responsibilities**:
- Provide real-time device monitoring interface
- Enable remote command execution
- Display analytics and reporting
- Manage bank card templates
- Handle user authentication and access control

**Key Features**:
- **Real-time Updates**: Firebase-based live data
- **Smooth Animations**: SectionAnimator system
- **Template Management**: Bank card template CRUD
- **API Logging**: Enhanced filtering and monitoring

### 3. FastPay Backend (Django REST API)

**Technology**: Django 4.x, Django REST Framework, Celery

**Responsibilities**:
- Provide RESTful API endpoints
- Handle Gmail OAuth integration
- Manage bank card templates
- Process API request logging
- Coordinate with external services

**Key Features**:
- **API Endpoints**: Comprehensive REST API
- **Gmail Integration**: OAuth with enhanced error handling
- **Template System**: Bank card template management
- **Logging**: API request tracking with filtering

### 4. Firebase Realtime Database

**Technology**: Google Firebase Realtime Database

**Responsibilities**:
- Real-time data synchronization
- Device-to-dashboard communication
- Command queuing and status tracking
- Real-time analytics data

**Key Features**:
- **Real-time Sync**: Live data updates
- **Scalable**: Handles multiple concurrent connections
- **Secure**: Role-based access controls
- **Reliable**: Built-in conflict resolution

---

## Data Flow Architecture

### 1. Device-to-Dashboard Data Flow

```mermaid
sequenceDiagram
    participant APK as FastPay APK
    participant FB as Firebase
    participant Dashboard as Web Dashboard
    participant Backend as Django Backend
    
    APK->>FB: Write SMS/Notification data
    FB->>Dashboard: Real-time push notification
    Dashboard->>Backend: API requests (templates, logs)
    Backend->>Dashboard: API responses
    Dashboard->>FB: Write command requests
    FB->>APK: Real-time command push
    APK->>FB: Write command status
    FB->>Dashboard: Status update
```

### 2. Gmail OAuth Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Dashboard as Web Dashboard
    participant Backend as Django Backend
    participant Google as Google OAuth
    
    User->>Dashboard: Click "Connect Gmail"
    Dashboard->>Backend: Request OAuth URL
    Backend->>Google: OAuth initiation
    Google->>User: Authorization prompt
    User->>Google: Grant permission
    Google->>Backend: Authorization code
    Backend->>Google: Exchange for tokens
    Backend->>Backend: Store tokens
    Backend->>Dashboard: Success response
    Dashboard->>User: Gmail connected
```

### 3. API Request Logging Flow

```mermaid
sequenceDiagram
    participant Client as Client Request
    participant Backend as Django Backend
    participant DB as Database
    participant Log as API Log System
    
    Client->>Backend: API Request
    Backend->>Log: Log request details
    Backend->>DB: Process business logic
    Backend->>Log: Log response details
    Backend->>Client: API Response
    Log->>DB: Store log entry
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 7.2.4 | Build tool |
| **Tailwind CSS** | 3.x | Styling |
| **Radix UI** | Latest | Component primitives |
| **Firebase SDK** | 12.6.0 | Real-time database |
| **React Router** | 7.12.0 | Navigation |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Django** | 4.x | Web framework |
| **Django REST** | 3.x | API framework |
| **PostgreSQL** | 14+ | Primary database |
| **SQLite** | 3.x | Development database |
| **Redis** | 6.x | Cache and queue |
| **Celery** | 5.x | Background tasks |
| **Gunicorn** | 20.x | WSGI server |

### Infrastructure Stack

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Nginx** | Reverse proxy |
| **Firebase** | Real-time database |
| **Google OAuth** | Authentication |
| **SMS Gateway** | Message delivery |
| **Telegram API** | Notifications |

---

## Security Architecture

### 1. Authentication & Authorization

```mermaid
graph LR
    A[User Login] --> B[Firebase Auth]
    B --> C[Session Token]
    C --> D[Dashboard Access]
    D --> E[Backend API]
    E --> F[Resource Access]
    
    G[Device Auth] --> H[Device Token]
    H --> I[Firebase Rules]
    I --> J[Data Access]
```

### Security Layers

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Application** | Firebase Authentication | User identity verification |
| **API** | Session-based auth | API access control |
| **Database** | Firebase Security Rules | Data access permissions |
| **Network** | HTTPS/TLS | Encrypted communication |
| **Device** | Device tokens | Secure device identification |

### 2. Data Protection

- **Encryption**: All data in transit encrypted with TLS
- **Access Control**: Role-based permissions (Admin, OTP-only)
- **Data Validation**: Input sanitization and validation
- **Audit Logging**: Comprehensive API request logging
- **Secure Storage**: Sensitive data encrypted at rest

---

## Deployment Architecture

### 1. Production Deployment

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx Load Balancer]
    end
    
    subgraph "Web Servers"
        WS1[Web Server 1<br/>Django + Gunicorn]
        WS2[Web Server 2<br/>Django + Gunicorn]
    end
    
    subgraph "Application Servers"
        AS1[App Server 1<br/>Docker Containers]
        AS2[App Server 2<br/>Docker Containers]
    end
    
    subgraph "Database Layer"
        DB[PostgreSQL Cluster]
        RD[Redis Cluster]
    end
    
    subgraph "External Services"
        FB[Firebase]
        GA[Google APIs]
        SG[SMS Gateway]
    end
    
    LB --> WS1
    LB --> WS2
    WS1 --> AS1
    WS2 --> AS2
    AS1 --> DB
    AS2 --> DB
    AS1 --> RD
    AS2 --> RD
    AS1 --> FB
    AS2 --> FB
    AS1 --> GA
    AS2 --> GA
    AS1 --> SG
    AS2 --> SG
```

### 2. Staging Deployment

- **Single Server**: All components on one server
- **SQLite Database**: For development and testing
- **Local Firebase**: Separate Firebase project
- **Mock Services**: Simulated external APIs

### 3. Container Architecture

```yaml
# docker-compose.yml structure
services:
  web:          # Django application
    image: fastpay-backend
    ports: ["8000:8000"]
  
  db:           # PostgreSQL database
    image: postgres:14
    volumes: ["postgres_data:/var/lib/postgresql/data"]
  
  redis:        # Redis cache
    image: redis:6-alpine
    ports: ["6379:6379"]
  
  nginx:        # Reverse proxy
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx:/etc/nginx/conf.d"]
```

---

## Communication Patterns

### 1. Real-time Communication

**Firebase Real-time Database** enables:
- **Push Notifications**: Instant data updates
- **Command Queuing**: Remote command execution
- **Status Tracking**: Live device status
- **Data Synchronization**: Multi-client consistency

### 2. REST API Communication

**Django REST Framework** provides:
- **CRUD Operations**: Standard data operations
- **Authentication**: Session-based security
- **Serialization**: Data format consistency
- **Error Handling**: Comprehensive error responses

### 3. External Service Integration

**Third-party APIs**:
- **Gmail OAuth**: Email account integration
- **SMS Gateway**: Message delivery
- **Telegram API**: Notification system

---

## Scalability Considerations

### 1. Horizontal Scaling

- **Web Servers**: Multiple Django instances behind load balancer
- **Database**: Read replicas for read-heavy operations
- **Cache**: Redis cluster for distributed caching
- **Firebase**: Automatically scales with usage

### 2. Performance Optimization

- **Database Indexing**: Optimized query performance
- **Caching Strategy**: Multi-level caching (Redis, Firebase)
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Celery for background tasks

### 3. Monitoring & Observability

- **Application Metrics**: Performance and error tracking
- **Database Monitoring**: Query performance and connections
- **Infrastructure Metrics**: Server resources and network
- **User Analytics**: Usage patterns and behavior

---

## Integration Points

### 1. Firebase Integration

**Real-time Data Paths**:
```
device/{deviceId}/              # Device-specific data
message/{deviceId}/             # SMS messages
notification/{deviceId}/        # Notifications
contact/{deviceId}/             # Contacts
hertbit/{deviceId}/             # Heartbeat data
fastpay/{mode}/{code}/          # Device lists
```

### 2. Backend API Integration

**Key Endpoints**:
```
/api/devices/                   # Device management
/api/messages/                  # SMS operations
/api/notifications/             # Notification management
/api/contacts/                  # Contact operations
/api/bank-card-templates/      # Template management
/api/api-request-logs/         # API logging
/api/gmail/                     # Gmail integration
```

### 3. External Service Integration

**Third-party APIs**:
- **Google OAuth 2.0**: Gmail account access
- **SMS Gateway**: Message delivery services
- **Telegram Bot API**: Notification delivery

---

## Future Architecture Considerations

### 1. Microservices Migration

- **Service Decomposition**: Split monolithic backend
- **API Gateway**: Centralized API management
- **Service Mesh**: Inter-service communication
- **Event Sourcing**: Audit trail and event replay

### 2. Enhanced Security

- **Zero Trust**: Enhanced security model
- **Multi-factor Auth**: Additional authentication layers
- **Data Encryption**: End-to-end encryption
- **Compliance**: GDPR and other regulations

### 3. Advanced Features

- **Machine Learning**: Predictive analytics
- **Advanced Monitoring**: AIOps integration
- **Multi-tenancy**: Support for multiple organizations
- **Global Deployment**: Multi-region deployment

---

*This architecture document serves as the foundation for understanding the FastPay system's design and implementation decisions. All architectural changes should be reflected in this document.*
