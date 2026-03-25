# Learn Lead Academy — Full-Stack Learning Platform

## Overview

Learn Lead Academy is a comprehensive **full-stack online learning platform** designed to deliver courses, manage student enrollments, track progress, and provide admin controls for course administration.

### Technology Stack

**Frontend:**
- React 18 + TypeScript for strict type safety
- Vite 5 for ultra-fast development and optimized builds
- Tailwind CSS for utility-first styling
- shadcn/ui for accessible, pre-built components
- React Router for client-side navigation
- TanStack Query for server state management

**Backend:**
- ASP.NET Core 8 Web API with Clean Architecture principles
- MongoDB for flexible, scalable data storage
- JWT (JSON Web Tokens) for stateless authentication
- Serilog for structured logging
- FluentValidation + AutoMapper for input validation and data mapping

This README documents project structure, configuration setup, deployment secrets, and step-by-step guides for running locally and in production.

---

## 1) Repository Structure

The project is organized into backend and frontend applications in a monorepo layout:

### Main directories

```
learn-lead-academy/
├── backend/                                    # .NET 8 Web API solution
│   ├── LearnLead.sln                          # Solution file (entry point)
│   │
│   ├── LearnLead.API/                         # Web API host layer
│   │   ├── appsettings.json                   # Default config
│   │   ├── appsettings.Development.json       # Dev-specific config
│   │   ├── Program.cs                         # App startup & DI setup
│   │   ├── Controllers/                       # API endpoints
│   │   │   ├── AuthController.cs              # Auth flows (login, register, refresh)
│   │   │   ├── CoursesController.cs           # Public course listing
│   │   │   ├── UsersController.cs             # Student profile & enrollments
│   │   │   ├── VideosController.cs            # Video upload/management
│   │   │   └── AdminController.cs             # Admin dashboard & settings
│   │   ├── Middleware/                        # Cross-cutting concerns
│   │   │   ├── ExceptionMiddleware.cs         # Global error handling
│   │   │   └── SecurityHeadersMiddleware.cs   # Security headers (CORS, CSP, etc)
│   │   ├── Properties/
│   │   │   └── launchSettings.json            # Launch config (port, env variables)
│   │   └── wwwroot/                           # Static file serving (videos, uploads)
│   │
│   ├── LearnLead.Application/                 # Business logic & DTOs layer
│   │   ├── Services/                          # Core business services
│   │   │   ├── AuthService.cs                 # JWT token generation, password hashing
│   │   │   ├── CourseService.cs               # Course CRUD operations
│   │   │   ├── VideoService.cs                # Video metadata management
│   │   │   ├── LessonService.cs               # Lesson CRUD & video linking
│   │   │   ├── UserService.cs                 # User profile & role management
│   │   │   ├── DashboardService.cs            # Admin analytics
│   │   │   └── SettingsService.cs             # Academy settings management
│   │   ├── DTOs/                              # Data Transfer Objects (API contracts)
│   │   │   ├── Auth/                          # Login, register, token responses
│   │   │   ├── Courses/                       # Course request/response models
│   │   │   ├── Videos/                        # Video metadata models
│   │   │   ├── Lessons/                       # Lesson models
│   │   │   ├── Users/                         # User profile models
│   │   │   └── Dashboard/                     # Dashboard statistics
│   │   ├── Interfaces/                        # Service contracts
│   │   ├── Validators/                        # FluentValidation rules
│   │   ├── Mappings/                          # AutoMapper profiles
│   │   └── DependencyInjection.cs             # Service registration
│   │
│   ├── LearnLead.Domain/                      # Core entities & domain logic
│   │   ├── Entities/                          # Database models
│   │   │   ├── User.cs                        # User with roles (Student, Admin)
│   │   │   ├── Course.cs                      # Course definition
│   │   │   ├── Lesson.cs                      # Lesson within course
│   │   │   ├── Video.cs                       # Video metadata
│   │   │   ├── Enrollment.cs                  # Student enrollment record
│   │   │   └── AcademySettings.cs             # Platform-wide settings
│   │   ├── Enums/                             # Domain enumerations
│   │   │   ├── UserRole.cs                    # Enum: Student, Admin
│   │   │   └── UserStatus.cs                  # Enum: Active, Suspended
│   │   ├── Exceptions/                        # Custom domain exceptions
│   │   │   ├── DomainException.cs             # General domain errors
│   │   │   ├── NotFoundException.cs            # 404 errors
│   │   │   └── UnauthorizedException.cs       # 401 errors
│   │   └── Interfaces/                        # Repository contracts
│   │
│   └── LearnLead.Infrastructure/              # Data access & external services
│       ├── Persistence/                       # MongoDB repositories
│       │   ├── MongoDbContext.cs              # MongoDB connection & collection setup
│       │   └── Repositories/                  # Each entity has a repository
│       │       ├── UserRepository.cs
│       │       ├── CourseRepository.cs
│       │       ├── VideoRepository.cs
│       │       ├── EnrollmentRepository.cs
│       │       ├── LessonRepository.cs
│       │       └── SettingsRepository.cs
│       ├── Security/                          # JWT & authentication
│       │   └── TokenService.cs                # JWT generation & validation
│       └── Email/                             # Email service integration
│           └── BrevoEmailService.cs           # Brevo email API client
│
├── learn-lead-academy-main/
│   └── learn-lead-academy-main/               # React frontend app
│       ├── package.json                       # Dependencies & npm scripts
│       ├── vite.config.ts                     # Vite build configuration
│       ├── tsconfig.json                      # TypeScript configuration
│       ├── .env.local                         # Local env variables (git-ignored)
│       │
│       ├── index.html                         # HTML entry point
│       ├── src/
│       │   ├── main.tsx                       # React app bootstrap
│       │   ├── App.tsx                        # Root routing component
│       │   ├── index.css                      # Global styles
│       │   │
│       │   ├── lib/
│       │   │   ├── api.ts                     # HTTP client & API methods
│       │   │   └── utils.ts                   # Helper utilities
│       │   │
│       │   ├── pages/                         # Page components
│       │   │   ├── Index.tsx                  # Home/landing page
│       │   │   ├── Courses.tsx                # Browse courses
│       │   │   ├── CourseDetail.tsx           # Single course with lessons
│       │   │   ├── Dashboard.tsx              # Student dashboard
│       │   │   ├── Login.tsx                  # Auth page (login/signup)
│       │   │   ├── NotFound.tsx               # 404 page
│       │   │   └── admin/                     # Admin section
│       │   │       ├── AdminDashboard.tsx     # Admin overview
│       │   │       ├── AdminCourses.tsx       # Course management
│       │   │       ├── AdminLessons.tsx       # Lesson CRUD
│       │   │       ├── AdminVideos.tsx        # Video upload (file & YouTube)
│       │   │       ├── AdminUsers.tsx         # User management
│       │   │       └── AdminSettings.tsx      # Platform settings
│       │   │
│       │   ├── components/                    # Reusable UI components
│       │   │   ├── Navbar.tsx                 # Top navigation
│       │   │   ├── Footer.tsx                 # Footer
│       │   │   ├── AdminSidebar.tsx           # Admin sidebar menu
│       │   │   ├── CourseCard.tsx             # Course display card
│       │   │   └── ui/                        # shadcn/ui components
│       │   │       ├── button.tsx
│       │   │       ├── card.tsx
│       │   │       ├── select.tsx
│       │   │       ├── dialog.tsx
│       │   │       └── ... (other components)
│       │   │
│       │   ├── layouts/
│       │   │   └── AdminLayout.tsx            # Wrapper for admin pages
│       │   │
│       │   ├── hooks/
│       │   │   ├── use-toast.ts               # Toast notifications
│       │   │   └── use-mobile.tsx             # Mobile responsiveness hook
│       │   │
│       │   └── data/
│       │       └── courses.ts                 # Static course seed data
│       │
│       ├── public/
│       │   └── robots.txt
│       │
│       └── dist/                              # Build output (production)
│
└── readme.md                                  # This file
```

### Quick navigation

**Navigate to backend:**
```bash
cd backend/LearnLead.API
```

**Navigate to frontend:**
```bash
cd learn-lead-academy-main/learn-lead-academy-main
```

---

## 2) Features & Architecture

### Platform Roles & User Journeys

**Student (Unauthenticated)**
- Browse all published courses by category
- View course details including lesson previews
- Sign up or log in to continue

**Student (Authenticated)**
- View personalized dashboard with:
  - Active enrollments
  - Progress tracking per course
  - Next lesson recommendations
- Enroll in courses (one-time payment)
  - Gain lifetime access to course materials
  - Access free preview lessons without enrollment
- Watch video lessons (file uploads or YouTube links)
- See completion progress

**Admin (Academy Manager)**
- **Course Management:**
  - Create, edit, delete courses
  - Manage course metadata (title, description, category, pricing)
  - Publish/unpublish courses
  - View enrollment statistics per course

- **Lesson Management:**
  - Add, edit, delete lessons within a course
  - Reorder lessons (drag-and-drop or manual order)
  - Mark lessons as free preview content
  - Link videos to lessons

- **Video Management (Dual Upload):**
  - **File Upload:** Upload video files directly (stored in wwwroot/uploads/videos)
  - **YouTube Link:** Paste YouTube URLs (embedded as iframes during playback)
  - Link videos to courses and lessons
  - Delete videos and cleanup
  - Filter and paginate video list

- **User Management:**
  - View all registered users
  - Suspend or activate user accounts
  - Monitor user enrollments

- **Academy Settings:**
  - Update academy name, contact email, phone
  - Manage academy description and logo
  - Configure platform-wide branding

- **Dashboard & Analytics:**
  - View total courses, students, videos, enrollments
  - Track total revenue
  - See recent enrollments in real-time

### API Modules

| Module | Path | Purpose | Auth |
|--------|------|---------|------|
| Auth | `/api/auth` | Register, login, admin login, refresh token, logout | None (Public) |
| Courses | `/api/courses` | List, filter, get details, view public lessons | None (Public) |
| Users | `/api/users` | Profile, enrollments, enroll, update progress | JWT (Student) |
| Admin (General) | `/api/admin` | Dashboard, users, settings, courses | JWT (Admin) |
| Videos | `/api/admin/videos` | List, upload (file), link from YouTube, delete | JWT (Admin) |
| Health | `/health` | Liveness probe for deployments | None (Public) |
| Swagger | `/swagger` | Interactive API documentation | None (Public) |

---

## 3) Technology Stack — In-Depth

### Frontend Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **React** | 18.3.1 | UI rendering engine with hooks & concurrent rendering |
| **TypeScript** | 5.8.3 | Static type checking for JavaScript (catches bugs at build time) |
| **Vite** | 5.4.19 | Lightning-fast dev server & production bundler (ES modules native) |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework (rapid responsive design) |
| **shadcn/ui** | Latest | Pre-built, customizable React components (button, dialog, select, etc) |
| **React Router** | 6.30.1 | Client-side navigation (public & protected routes) |
| **TanStack Query** | 5.83.0 | Server state management (caching, synchronization, background updates) |
| **React Hook Form** | 7.61.1 | Lightweight form state management |
| **Sonner** | 1.7.4 | Toast notifications (success, error, info) |
| **Lucide React** | 0.462.0 | 1000+ clean SVG icons |

**Build & Quality Tools:**
- **Vitest** 3.2.4 — Fast unit test runner compatible with Jest API
- **Playwright** 1.57.0 — E2E test automation framework
- **ESLint** 9.32.0 — Code quality & style enforcement
- **PostCSS** 8.5.6 — CSS transformations (autoprefixer, Tailwind)

### Backend Stack

| Library/Framework | Version | Purpose |
|-------------------|---------|---------|
| **.NET SDK** | 8.0+ | Modern C# runtime with LINQ, async/await, records |
| **ASP.NET Core** | 8.0 | Web API host, dependency injection, middleware pipeline |
| **MongoDB.Driver** | Latest | Official MongoDB C# client |
| **JWT Bearer** | 8.0 | JWT token validation & authorization middleware |
| **AutoMapper** | 13.0.1 | Object-to-object mapping (DTOs ↔ Entities) |
| **FluentValidation** | 11.11.0 | Fluent validation rules for DTOs |
| **Serilog** | Latest | Structured logging (console, file, cloud sinks) |
| **Brevo** | Integration | Email delivery service (transactional emails) |

**Architecture Pattern:** Clean Architecture with layered separation:
- **API Layer** (Controllers) — HTTP endpoints & middleware
- **Application Layer** (Services, DTOs, Validators) — Business logic
- **Domain Layer** (Entities, Enums, Exceptions) — Core domain rules
- **Infrastructure Layer** (Repositories, DB context, Auth) — Data & external services

---

## 4) Prerequisites & Installation

### System Requirements

**For Frontend Development:**
- **Node.js** 18.0.0 or higher (20 LTS recommended)
  - Provides npm/npx for JavaScript package management
  - Minimum 18 for React 18 compatibility
- **npm** 9+ (comes with Node.js, or use yarn/pnpm)

**For Backend Development:**
- **.NET 8 SDK** (download from https://dotnet.microsoft.com/download)
  - Provides `dotnet` CLI for building, running, testing
  - Includes runtime and C# compiler

**For Data Storage:**
- **MongoDB** 5.0+ (local or cloud cluster from MongoDB Atlas)
  - Local: `brew install mongodb-community` (macOS) or `choco install mongodb` (Windows)
  - Cloud: Create free cluster at https://www.mongodb.com/cloud/atlas

### Installation Steps

#### 1. Verify Prerequisites

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check .NET SDK version (should be 8.0+)
dotnet --version

# Verify MongoDB is running (local)
mongosh  # or `mongo` for older versions
```

#### 2. Clone & Setup Frontend

```bash
# Navigate to frontend
cd learn-lead-academy-main/learn-lead-academy-main

# Install dependencies
npm install

# Create .env.local file
echo 'VITE_API_BASE_URL=http://localhost:5216/api' > .env.local

# Verify installation
npm list  # Shows installed packages
```

#### 3. Clone & Setup Backend

```bash
# Navigate to backend API
cd backend/LearnLead.API

# Restore NuGet packages
dotnet restore

# Set up user secrets (see section 5 for details)
dotnet user-secrets set "Jwt:Secret" "your-secret-key-here"
dotnet user-secrets set "MongoDB:ConnectionString" "your-mongodb-url"
```

### Optional Tools

**Recommended:**
- **MongoDB Compass** — GUI for MongoDB (visualize data)
- **Postman** or **Insomnia** — API testing tools
- **VS Code Extensions:**
  - C# Dev Kit (official Microsoft extension)
  - REST Client (test API directly in VS Code)
  - Thunder Client (lightweight Postman alternative)

---

## 5) Backend Configuration Guide

### How Backend Configuration Works

The ASP.NET Core backend reads configuration from multiple sources (in order of precedence):

1. **User Secrets** (local development) — Most secure for local dev
2. **Environment Variables** (cloud deployments)
3. **appsettings.json** (defaults)
4. **appsettings.Development.json** (dev overrides)

### Startup Flow (from `Program.cs`)

```csharp
1. ReadConfiguration → Load from secrets/env/appsettings
2. ConfigureServices → Register all services (auth, database, logging)
3. ConfigureMiddleware → Add error handling, security, CORS
4. MapControllers → Register API routes (/api/*)
5. UseSwagger → Enable API docs at /swagger
```

**At runtime, the API:**
- ✓ Listens on `http://localhost:5216` (from `Properties/launchSettings.json`)
- ✓ Uses JWT bearer authentication for protected endpoints
- ✓ Enforces CORS using `AllowedOrigins` config
- ✓ Logs structured events to console (Serilog)
- ✓ Serves static files from `wwwroot/` (video uploads)
- ✓ Connects to MongoDB on startup (health check)

### Configuration Settings Reference

#### Authentication & Security

| Setting | Example | Purpose | Required |
|---------|---------|---------|----------|
| `Jwt:Secret` | `"super-secret-key-32-chars-min"` | Signs JWT tokens (must be 32+ chars) | ✅ YES |
| `Jwt:Issuer` | `"learnlead-api"` | "Who issued this token" (validation) | ⭐ Recommended |
| `Jwt:Audience` | `"learnlead-frontend"` | "Who is this token for" (validation) | ⭐ Recommended |
| `AllowedOrigins` | `"http://localhost:5173,https://app.example.com"` | CORS whitelist (comma-separated) | ⭐ Recommended |

#### Database Connection

| Setting | Example | Purpose | Required |
|---------|---------|---------|----------|
| `MongoDB:ConnectionString` | `"mongodb+srv://user:pass@cluster.mongodb.net/"` | MongoDB URI | ✅ YES |
| `MongoDB:DatabaseName` | `"LearnLeadDb"` | Database name in MongoDB cluster | ✅ YES |

**MongoDB Connection String Format:**
```
Local:  mongodb://localhost:27017
Atlas:  mongodb+srv://username:password@cluster-name.mongodb.net/
```

#### Email Service

| Setting | Example | Purpose | Required |
|---------|---------|---------|----------|
| `Brevo:ApiKey` | `"xkeysib-1234567890abcdef..."` | API key from Brevo dashboard | ✅ YES (if email used) |
| `Brevo:FromEmail` | `"no-reply@academy.com"` | Sender email address | ⭐ Recommended |
| `Brevo:FromName` | `"Learn Lead Academy"` | Sender display name | ⭐ Recommended |

#### Environment

| Setting | Value | Purpose |
|---------|-------|---------|
| `ASPNETCORE_ENVIRONMENT` | `Development`, `Production` | Controls logging level & error responses |

### Setting Up Local Development (User Secrets)

User Secrets are stored **securely on your machine** (not in version control):

```bash
# Navigate to API project
cd backend/LearnLead.API

# Set a strong JWT secret (32+ characters)
dotnet user-secrets set "Jwt:Secret" "my-super-secure-jwt-secret-key-min-32-chars-1234567890"

# Set Issuer & Audience
dotnet user-secrets set "Jwt:Issuer" "learnlead-api"
dotnet user-secrets set "Jwt:Audience" "learnlead-frontend"

# Configure MongoDB (Atlas example)
dotnet user-secrets set "MongoDB:ConnectionString" "mongodb+srv://admin:password123@cluster0.xyz.mongodb.net/"
dotnet user-secrets set "MongoDB:DatabaseName" "LearnLeadDb"

# Configure Email (Brevo)
dotnet user-secrets set "Brevo:ApiKey" "xkeysib-your-api-key-here"
dotnet user-secrets set "Brevo:FromEmail" "noreply@localhost"
dotnet user-secrets set "Brevo:FromName" "Learn Lead"

# Allow localhost frontend
dotnet user-secrets set "AllowedOrigins" "http://localhost:5173"

# Verify secrets are set
dotnet user-secrets list
```

**Location of User Secrets:**
- **Windows:** `%APPDATA%\Microsoft\UserSecrets\<UserSecretsId>\secrets.json`
- **macOS/Linux:** `~/.microsoft/usersecrets/<UserSecretsId>/secrets.json`

### Setting Up Production (Environment Variables)

In cloud platforms, use **environment variables** with double-underscore (`__`) separators for nested keys:

```bash
# ASP.NET Core automatically converts __ to : in config keys
ASPNETCORE_ENVIRONMENT=Production
Jwt__Secret=your-prod-secret-key
Jwt__Issuer=learnlead-api
Jwt__Audience=learnlead-frontend
MongoDB__ConnectionString=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/
MongoDB__DatabaseName=LearnLeadDb
Brevo__ApiKey=your-prod-brevo-key
Brevo__FromEmail=noreply@yourdomain.com
Brevo__FromName=Learn Lead Academy
AllowedOrigins=https://app.yourdomain.com
```

**Cloud Platform Examples:**
- **Azure App Service:** Configuration → Application settings
- **Heroku:** Settings → Config vars
- **AWS ECS:** Task definition → Container environment variables
- **Google Cloud Run:** Container image → Environment variables

---

## 6) Frontend Configuration Guide

### How Frontend Configuration Works

Vite uses `.env.*` files to inject variables at **build time**. Variables prefixed with `VITE_` are exposed to client code.

**Precedence (highest to lowest):**
1. `.env.local` (git-ignored, local machine)
2. `.env.[mode].local` (git-ignored, mode-specific)
3. `.env.[mode]` (version-controlled, mode-specific)
4. `.env` (version-controlled, all modes)

### Environment Variables

The frontend uses only one critical variable:

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:5216/api` | Base URL for all API requests |

### Setting Up Local Development

**Create `.env.local` in frontend root:**

```bash
# learn-lead-academy-main/learn-lead-academy-main/.env.local
VITE_API_BASE_URL=http://localhost:5216/api
```

**How this is used in `src/lib/api.ts`:**

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5216/api";

// All API requests use this BASE_URL
export const authApi = {
  login: (body) => request(`${BASE_URL}/auth/login`, /* ... */),
  register: (body) => request(`${BASE_URL}/auth/register`, /* ... */),
};
```

### Runtime API Configuration

When the app runs:

```typescript
// 1. At build time: VITE_API_BASE_URL is replaced with env value
// 2. At runtime: BASE_URL constant is used for all fetch() calls
// 3. If env not set: Falls back to http://localhost:5216/api
```

### Setting Up Production

**Create `.env.production` (or set at deployment):**

```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

Or set at deployment time:

```bash
# Build command can override
npm run build -- --mode production \
  && VITE_API_BASE_URL=https://api.yourdomain.com/api npm run build
```

**Cloud Deployment Examples:**

**Netlify/Vercel:**
```
Environment Variables:
  VITE_API_BASE_URL = https://api.yourdomain.com/api
Build Command: npm run build
```

**AWS S3 + CloudFront:**
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api

npm run build
aws s3 sync dist/ s3://my-bucket --delete
```

### Development vs. Production Behavior

| Environment | `VITE_API_BASE_URL` | Logs | Error Handling |
|-------------|-------------------|------|----------------|
| Development | `http://localhost:5216/api` | Verbose (console) | Full error messages |
| Production | `https://api.yourdomain.com/api` | Minimal | User-friendly messages |

### API Client (`src/lib/api.ts`)

All frontend API requests go through the `request()` function:

```typescript
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Authorization": `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error ?? "Request failed");
  }

  return res.json();
}
```

**Features:**
- ✓ Automatic JWT token injection in header
- ✓ JSON serialization/deserialization
- ✓ Error handling with user messages
- ✓ Token refresh on 401 (auto-retry)

---

## 7) Running Locally — Complete Guide

### Step-by-Step Startup

#### 1️⃣ Start the Backend API

**Terminal 1: Backend**

```bash
# Navigate to backend
cd backend/LearnLead.API

# Restore NuGet packages (first time only)
dotnet restore

# Run the API
dotnet run

# Expected output:
# info: Microsoft.Hosting.Lifetime[14]
#   Now listening on: http://localhost:5216
# Application started. Press Ctrl+C to shut down.
```

**Verify Backend:**

```bash
# New terminal, check health
curl http://localhost:5216/health

# Response: {"status":"Healthy"}

# View Swagger API docs
open http://localhost:5216/swagger  # macOS
# or https://localhost:5216/swagger in browser
```

#### 2️⃣ Start the Frontend Dev Server

**Terminal 2: Frontend**

```bash
# Navigate to frontend
cd learn-lead-academy-main/learn-lead-academy-main

# Install dependencies (first time only)
npm install

# Run dev server
npm run dev

# Expected output:
#   VITE v5.4.19  ready in 245 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

**Access Frontend:**
```
http://localhost:5173
```

#### 3️⃣ Test the Integration

**In browser at `http://localhost:5173`:**

1. ✓ Homepage loads
2. ✓ Click "Browse Courses" → should fetch courses from backend
3. ✓ Click "Sign In" → login page appears
4. ✓ Create account:
   - Email: `test@example.com`
   - Password: `Test123!`
5. ✓ After login → Dashboard appears

**If API requests fail:**

```bash
# Check backend is running
curl http://localhost:5216/api/courses

# Check CORS is configured (should see allowed origin in response)
curl -i http://localhost:5216/api/courses

# Check .env.local has correct URL
cat learn-lead-academy-main/learn-lead-academy-main/.env.local
```

### Common Startup Issues

#### ❌ "Cannot GET /api/courses" (404)

**Cause:** Backend not running or wrong URL

**Fix:**
```bash
# 1. Verify backend is running
ps aux | grep dotnet

# 2. Verify port 5216 is listening
netstat -an | grep 5216

# 3. Restart backend
cd backend/LearnLead.API
dotnet run
```

#### ❌ "CORS error: No 'Access-Control-Allow-Origin'"

**Cause:** Frontend origin not in `AllowedOrigins`

**Fix:**
```bash
# In backend terminal, update user secrets
cd backend/LearnLead.API
dotnet user-secrets set "AllowedOrigins" "http://localhost:5173"

# Restart backend
dotnet run
```

#### ❌ "MongoDB connection refused"

**Cause:** MongoDB not running or wrong connection string

**Fix:**
```bash
# Start local MongoDB
brew services start mongodb-community  # macOS
# or start Docker container
docker run -d -p 27017:27017 mongo:latest

# Verify connection string in user secrets
cd backend/LearnLead.API
dotnet user-secrets set "MongoDB:ConnectionString" "mongodb://localhost:27017"
```

#### ❌ "JWT:Secret not configured"

**Cause:** User secret not set

**Fix:**
```bash
cd backend/LearnLead.API
dotnet user-secrets set "Jwt:Secret" "super-secret-key-32-chars-minimum-required"
dotnet run  # Restart
```

#### ❌ Frontend shows blank page

**Cause:** Vite dev server not starting or build error

**Fix:**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache & reinstall
cd learn-lead-academy-main/learn-lead-academy-main
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Stopping Services

```bash
# Stop backend (in Terminal 1)
Press Ctrl+C

# Stop frontend (in Terminal 2)
Press Ctrl+C

# Stop MongoDB (if running locally)
brew services stop mongodb-community  # macOS
```

---

## 8) Frontend Development Commands

Run inside `learn-lead-academy-main/learn-lead-academy-main/`:

### Building & Serving

| Command | Purpose | Use Case |
|---------|---------|----------|
| `npm run dev` | Start Vite dev server (hot reload) | Local development |
| `npm run build` | Production build (minified, optimized) | Before deployment |
| `npm run build:dev` | Development-mode build (unminified) | Debug production code |
| `npm run preview` | Preview production build locally | Test build before deploy |

### Quality & Testing

| Command | Purpose | Use Case |
|---------|---------|----------|
| `npm run lint` | Run ESLint (code style check) | Find code issues |
| `npm run test` | Run Vitest (unit tests once) | CI/CD pipelines |
| `npm run test:watch` | Run Vitest in watch mode | Active test development |

### Common Workflows

**Local Development:**
```bash
npm run dev
# Open http://localhost:5173
# Changes auto-reload in browser
```

**Before Committing Code:**
```bash
npm run lint     # Fix style issues
npm run test     # Ensure tests pass
```

**Production Build & Deploy:**
```bash
npm run build    # Creates ./dist folder
# Test the build locally first
npm run preview

# Deploy ./dist to hosting (Netlify, Vercel, AWS S3, etc)
```

### Output Directories

- **`./dist`** — Production build output (index.html + chunks)
- **`./node_modules`** — Installed dependencies
- **`.eslintcache`** — ESLint cache (auto-generated)

---

## 9) Cloud Hosting & Production Deployment

### Architecture Overview

```
[Frontend App] (React + Vite)
       ↓
    HTTPS
       ↓
   CDN / Static Hosting
(Netlify, Vercel, AWS S3+CloudFront)
       ↓ API Requests ↓
   HTTPS (CORS enabled)
       ↓
[Backend API] (.NET Core)
   (Azure App Service, AWS EC2, Heroku, Railway)
       ↓
   MongoDB Atlas
(Cloud MongoDB cluster)
```

### Step 1: Provision Infrastructure

#### Backend Hosting Options

| Platform | Hosting | Scaling | Cost | Setup Time |
|----------|---------|---------|------|-----------|
| **Azure App Service** | Managed | Auto | Pay-per-use | 20 min |
| **AWS EC2** | Self-managed | Manual | Pay hourly | 30 min |
| **Heroku** | Managed | Auto | Hobby/Pro | 10 min |
| **Railway** | Managed | Auto | Pay-per-use | 15 min |
| **Google Cloud Run** | Serverless | Auto | Pay-per-call | 20 min |

#### Database Hosting

```bash
# Create MongoDB Atlas cluster (free tier available)
1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create Project → Create Database
4. Cluster tier: M0 (free, 512MB)
5. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/
```

#### Frontend Hosting Options

| Platform | Cost | Deployment | Auto-Deploy | Custom Domain |
|----------|------|-----------|------------|--------------|
| **Netlify** | Free tier available | Drag-drop or Git | ✓ Yes (GitHub) | ✓ Yes/.app |
| **Vercel** | Free tier available | Git integration | ✓ Yes (GitHub) | ✓ Yes |
| **AWS S3 + CloudFront** | Pay-per-request | AWS CLI | ✗ Manual | ✓ Yes |
| **GitHub Pages** | Free | Git push | ✓ Yes | ✓ Custom domain |

### Step 2: Backend Deployment

#### Option A: Heroku (Quickest)

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set Jwt__Secret="your-prod-secret" \
  Jwt__Issuer="learnlead-api" \
  Jwt__Audience="learnlead-frontend" \
  MongoDB__ConnectionString="mongodb+srv://user:pass@cluster.mongodb.net/" \
  MongoDB__DatabaseName="LearnLeadDb" \
  Brevo__ApiKey="your-brevo-key" \
  AllowedOrigins="https://yourdomain.com"

# Deploy
git push heroku main

# View logs
heroku logs --tail

# API will be at: https://your-app-name.herokuapp.com/api
```

#### Option B: Azure App Service (Enterprise)

```bash
# Login to Azure
az login

# Create resource group
az group create --name myResourceGroup --location "East US"

# Create App Service
az appservice plan create --name myPlan --resource-group myResourceGroup --sku B1

# Deploy
az webapp up --name your-app-name --resource-group myResourceGroup --runtime "dotnet:8"

# Set environment variables
az webapp config appsettings set --name your-app-name \
  --resource-group myResourceGroup \
  --settings \
    Jwt__Secret="your-secret" \
    MongoDB__ConnectionString="mongodb+srv://..." \
    AllowedOrigins="https://yourdomain.com"
```

#### Option C: AWS EC2 (Full Control)

```bash
# 1. Launch Ubuntu 22.04 instance
# 2. SSH in
ssh -i key.pem ubuntu@instance-ip

# 3. Install .NET 8 SDK
wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update && sudo apt install -y dotnet-sdk-8.0

# 4. Clone repo
git clone https://github.com/yourusername/learn-lead-academy.git

# 5. Deploy
cd backend/LearnLead.API
dotnet publish -c Release -o ./publish

# 6. Run as service (systemd)
sudo nano /etc/systemd/system/learnlead.service
# [Add service config below]
```

**Systemd service file:**
```ini
[Unit]
Description=Learn Lead Academy API
After=network.target

[Service]
Type=notify
User=ubuntu
ExecStart=/home/ubuntu/learn-lead-academy/backend/LearnLead.API/publish/LearnLead.API
Restart=on-failure
RestartSec=10

Environment="Jwt__Secret=your-secret"
Environment="MongoDB__ConnectionString=mongodb+srv://..."
Environment="AllowedOrigins=https://yourdomain.com"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable learnlead
sudo systemctl start learnlead
sudo systemctl status learnlead
```

### Step 3: Frontend Deployment

#### Netlify (Recommended for Simplicity)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd learn-lead-academy-main/learn-lead-academy-main

# Login
netlify login

# Create .env.production
echo 'VITE_API_BASE_URL=https://api.yourdomain.com/api' > .env.production

# Deploy
netlify deploy --prod --dir=dist

# URL: https://your-app.netlify.app
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd learn-lead-academy-main/learn-lead-academy-main

# Deploy
vercel --prod

# Set environment variable
vercel env add VITE_API_BASE_URL https://api.yourdomain.com/api

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront

```bash
# Build
npm run build

# Create S3 bucket
aws s3api create-bucket \
  --bucket my-app-bucket \
  --region us-east-1 \
  --acl public-read

# Upload files
aws s3 sync ./dist s3://my-app-bucket --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name my-app-bucket.s3.amazonaws.com \
  --default-root-object index.html \
  --default-cache-behavior ViewerProtocolPolicy=redirect-to-https

# CDN URL: https://d123.cloudfront.net
```

### Step 4: Production Environment Variables

**Create a `.env` file for reference (don't commit secrets!):**

```bash
# .env.production.example (commit this)
VITE_API_BASE_URL=https://your-backend.com/api
```

**Platform-specific setup:**

| Platform | Location | Format |
|----------|----------|--------|
| **Heroku** | CLI or Dashboard | `KEY=VALUE` |
| **Azure** | App Service → Configuration | UI form |
| **AWS** | Systems Manager → Parameter Store | Hierarchical |
| **Vercel** | Project Settings → Environment | UI form |
| **Netlify** | Site Settings → Build & Deploy | UI form |

### Step 5: Custom Domain & SSL

```bash
# Point your domain DNS to hosting
# (Each platform has different DNS records to add)

# Verify SSL (most platforms auto-generate)
https://yourdomain.com

# Test API connectivity
curl https://yourdomain.com/api/health
```

### Monitoring & Logs

**Backend Logs:**
```bash
# Heroku
heroku logs --tail

# Azure
az webapp log stream --name your-app --resource-group myResourceGroup

# AWS CloudWatch
aws logs tail /aws/app/learnlead --follow
```

**Frontend Monitoring:**
- **Netlify Deployments:** Dashboard → Deploys
- **Vercel Analytics:** Dashboard → Analytics
- **Monitor uptime:** https://www.uptime.com or https://www.statuspage.io

---

## 10) Deployment Checklist

### Pre-Deployment Validation

- [ ] Backend builds without errors: `dotnet build`
- [ ] Frontend builds without errors: `npm run build`
- [ ] All tests pass: `npm run test`, `dotnet test`
- [ ] Code linting passes: `npm run lint`
- [ ] No secrets in version control (use `.gitignore`)

### Backend Deployment Checklist

- [ ] **Database Setup**
  - [ ] MongoDB cluster provisioned (Atlas or self-managed)
  - [ ] Database created: `LearnLeadDb`
  - [ ] Admin user created with appropriate permissions
  - [ ] Connection string verified: `mongodb+srv://...`

- [ ] **Environment Variables Set**
  - [ ] `ASPNETCORE_ENVIRONMENT=Production`
  - [ ] `Jwt__Secret` — Strong key, 32+ characters
  - [ ] `Jwt__Issuer` — e.g., `"learnlead-api"`
  - [ ] `Jwt__Audience` — e.g., `"learnlead-frontend"`
  - [ ] `MongoDB__ConnectionString` — Full URI
  - [ ] `MongoDB__DatabaseName` — `"LearnLeadDb"`
  - [ ] `Brevo__ApiKey` — Email service API key
  - [ ] `Brevo__FromEmail` — Sender address
  - [ ] `AllowedOrigins` — Frontend URL(s) only

- [ ] **Hosting Setup**
  - [ ] App hosting selected (Heroku, Azure, AWS, etc.)
  - [ ] Deploy pipeline configured (GitHub Actions, CI/CD)
  - [ ] Domain registered (optional, for custom domain)
  - [ ] SSL/TLS certificate provisioned (auto via Let's Encrypt)

- [ ] **Health Checks**
  - [ ] `/health` endpoint returns 200 OK
  - [ ] `/health/live` endpoint accessible
  - [ ] Swagger docs at `/swagger` (optional: disable in prod)
  - [ ] API responds to test request: `/api/courses`

- [ ] **Security Review**
  - [ ] CORS allows only production frontend URL
  - [ ] JWT secret is truly random (not hardcoded)
  - [ ] Database credentials are environment variables (not in code)
  - [ ] Security headers middleware is enabled
  - [ ] HTTPS enforced (not HTTP)

### Frontend Deployment Checklist

- [ ] **Build Validation**
  - [ ] Production build minimal and optimized (`npm run build`)
  - [ ] Build size reasonable (<500KB main bundle)
  - [ ] No source maps in production (security)

- [ ] **Environment Configuration**
  - [ ] `.env.production` has correct `VITE_API_BASE_URL`
  - [ ] `VITE_API_BASE_URL` points to production backend
  - [ ] No API URLs hardcoded in TypeScript files

- [ ] **Hosting Setup**
  - [ ] Static hosting selected (Netlify, Vercel, AWS S3+CloudFront)
  - [ ] Deploy pipeline configured (Git-based or manual)
  - [ ] Custom domain configured (if using)
  - [ ] SSL/TLS enabled (auto-generated by host)

- [ ] **Functionality Tests**
  - [ ] Home page loads and displays courses
  - [ ] API requests hit correct backend URL
  - [ ] Login flow works end-to-end
  - [ ] Course enrollment works
  - [ ] Admin dashboard accessible to admins
  - [ ] Video playback works (both file and YouTube)
  - [ ] Mobile responsive design looks good

- [ ] **Performance Validation**
  - [ ] Page load time < 3 seconds
  - [ ] API response time < 1 second
  - [ ] Lighthouse score > 80

- [ ] **Monitoring Setup**
  - [ ] Error tracking enabled (Sentry, Rollbar, etc.)
  - [ ] Analytics configured (Google Analytics, Mixpanel)
  - [ ] Uptime monitoring configured (StatusPage, Pingdom)
  - [ ] Email alerts set up for critical errors

### Post-Deployment

- [ ] Test all user flows in production
- [ ] Verify payments process correctly (if applicable)
- [ ] Check email notifications send properly
- [ ] Monitor error rates and performance
- [ ] Set up automated daily backups for MongoDB

---

## 11) Security Best Practices & Operations

### Secret Management

#### ✅ DO:

```bash
# Use environment variables in production
export Jwt__Secret="$(openssl rand -base64 32)"

# Use .NET User Secrets for local development
dotnet user-secrets set "Jwt:Secret" "..."

# Rotate secrets monthly
# Store in secure vault (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
```

#### ❌ DON'T:

```bash
# Never commit secrets to version control
# DON'T add to appsettings.json:
{
  "Jwt": {
    "Secret": "hardcoded-secret"  // ❌ SECURITY RISK
  }
}

# Never expose secrets in logs
Console.WriteLine($"JWT: {jwtSecret}"); // ❌ SECURITY RISK
```

### JWT Secret Generation

**Generate strong secrets:**

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object { Get-Random -Minimum 33 -Maximum 126 | ForEach-Object {[char]$_} }) -join ''))

# Online (use only for testing)
https://generate-random.org/
```

### JWT Token Expiration & Refresh

**Current implementation (configure in backend):**

```csharp
public class JwtSettings
{
    public string Secret { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int AccessTokenExpirationMinutes { get; set; } = 15;  // 15 mins
    public int RefreshTokenExpirationDays { get; set; } = 7;      // 7 days
}
```

**Best Practices:**
- Access token: 15–30 minutes (short-lived)
- Refresh token: 7–30 days (reissue access token)
- Rotate secrets quarterly
- Revoke tokens on logout

### CORS Configuration

**Security-first CORS setup:**

```csharp
// Only allow trusted origins in production
app.UseCors(builder =>
    builder
        .WithOrigins("https://app.yourdomain.com", "https://admin.yourdomain.com")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
);

// ❌ NEVER use AllowAnyOrigin() in production
```

### Database Security

**MongoDB Atlas Security:**

1. **Enable Database Users:**
   - Create user with scoped database access
   - Use complex passwords (20+ characters, mixed case)

2. **Network Access:**
   - Restrict IP whitelist (don't allow 0.0.0.0)
   - Use connection string with username/password
   - Enable SSL/TLS (default in Atlas)

3. **Backups:**
   - Atlas: Automatic backups enabled
   - Backup retention: 7+ days
   - Test restore procedures

**Connection String Security:**
```bash
# ✅ GOOD: Credentials in environment variable
MONGODB_CONNECTION_STRING="mongodb+srv://admin:securepass@cluster.mongodb.net/?ssl=true"

# ❌ BAD: Credentials in code
const uri = "mongodb+srv://admin:password@cluster.mongodb.net";
```

### API Security Headers

**Current implementation (SecurityHeadersMiddleware.cs):**

```csharp
// Enforce HTTPS
response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

// Prevent clickjacking
response.Headers.Add("X-Frame-Options", "DENY");

// Prevent MIME type sniffing
response.Headers.Add("X-Content-Type-Options", "nosniff");

// XSS protection
response.Headers.Add("X-XSS-Protection", "1; mode=block");

// CSP (Content Security Policy)
response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
```

### Rate Limiting

**Recommended: Add rate limiting middleware**

```bash
# Install NuGet package
dotnet add package AspNetCoreRateLimit

# Configure in Program.cs
services.AddMemoryCache();
services.AddInMemoryRateLimiting();
app.UseIpRateLimiting();
```

**Example configuration:**
```json
{
  "IpRateLimitPolicies": {
    "default": {
      "Name": "default rate limit",
      "Description": "Limit requests to 100 per 15 minutes",
      "Rules": [
        {
          "Endpoint": "*",
          "Period": "15m",
          "Limit": 100
        }
      ]
    }
  }
}
```

### Logging & Monitoring

**Sensitive Data Scrubbing:**

```csharp
// ❌ DO NOT log sensitive data
logger.LogInformation($"User password: {password}"); // RISK

// ✅ DO log safely
logger.LogInformation($"User login attempted for email: {email}");

// Use Serilog destructuring to hide sensitive properties
public class User
{
    [LogMasked(ShowFirst = 3, ShowLast = 2)]
    public string Email { get; set; }
}
```

**Structured Logging Setup (Serilog):**

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File("logs/app-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
```

### Dependency Updates

**Regularly update dependencies:**

```bash
# Frontend
npm outdated        # See outdated packages
npm update          # Update to latest minor/patch
npm audit fix       # Fix known vulnerabilities

# Backend
dotnet list package --outdated
dotnet add package SomePackage --version 1.2.3
```

### Backup & Disaster Recovery

**MongoDB Backup Strategy:**

```bash
# Local backup (test/dev)
mongodump --uri "mongodb://localhost:27017" --out ./backup

# Restore
mongorestore ./backup

# MongoDB Atlas: Automated backups included
```

**Database Replication:**

```bash
# Replica Set for high availability
# (Handled automatically by MongoDB Atlas)
```

### Compliance & Privacy

- [ ] GDPR: Implement right-to-be-forgotten (delete user data)
- [ ] CCPA: Allow data export & opt-out
- [ ] Terms of Service: Update & make prominent
- [ ] Privacy Policy: Describe data collection & usage
- [ ] Incident Response Plan: Prepare for data breach scenarios

---

## 12) Comprehensive Troubleshooting Guide

### Backend Issues

#### 🔴 "Unhandled exception: JWT token not found in claim"

**Cause:** JWT is not being validated correctly

**Debug:**
```bash
# Check JWT:Secret is set
dotnet user-secrets list | grep Jwt:Secret

# Should show:
# Jwt:Issuer = learnlead-api
# Jwt:Secret = ***
```

**Fix:**
```bash
cd backend/LearnLead.API
dotnet user-secrets set "Jwt:Secret" "$(openssl rand -base64 32)"
dotnet run
```

#### 🔴 "MongoDB connection timeout"

**Cause:** 
- MongoDB not running
- Wrong connection string
- Firewall blocking access

**Debug:**
```bash
# Test local MongoDB
mongo --version

# Try connecting directly
mongosh "mongodb://localhost:27017"
# or: mongo mongodb://localhost:27017

# If Atlas, verify IP whitelist
# Log into MongoDB Atlas → Network Access → Add IP address
```

**Fix:**
```bash
# Start MongoDB locally
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 mongo:latest

# Test connection
curl mongodb://localhost:27017

# For Atlas, update connection string
dotnet user-secrets set "MongoDB:ConnectionString" "mongodb+srv://user:password@cluster.mongodb.net/?ssl=true"
```

#### 🔴 "InvalidOperationException: Unable to resolve service for type 'IVideoService'"

**Cause:** Service not registered in dependency injection

**Debug:**
```bash
# Check Program.cs has all services registered:
# services.AddScoped<IVideoService, VideoService>();
```

**Fix:** Ensure `LearnLead.Application/DependencyInjection.cs` is called:
```csharp
// Program.cs
var builder = WebApplicationBuilder.CreateBuilder(args);
builder.Services.AddApplicationServices();  // ← This line
```

#### 🔴 "Swagger returns 404"

**Cause:** Swagger disabled or wrong URL

**Fix:**
```bash
# Access correct URL
http://localhost:5216/swagger

# If still 404, check Program.cs
app.UseSwagger();
app.UseSwaggerUI();
```

#### 🔴 "POST /api/auth/login returns 400: 'Invalid credentials'"

**Cause:**
- User doesn't exist
- Password incorrect
- Email/password not provided in request body

**Debug:**
```bash
# Check request body
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}

# Check user exists in database
mongosh
db.users.findOne({ email: "test@example.com" })
```

**Fix:**
```bash
# Register new user first
POST /api/auth/register
{
  "name": "Test",
  "email": "test@example.com",
  "password": "Test123!"
}

# Then try login
```

### Frontend Issues

#### 🔴 "Cannot GET /api/* (CORS error)"

**Cause:** Frontend origin not allowed by backend, or backend not running

**Debug:**
```javascript
// Check browser console
// Look for: Access to XMLHttpRequest from origin 'http://localhost:5173' 
// has been blocked by CORS policy

// Verify backend is running
curl http://localhost:5216/health
```

**Fix:**
```bash
# Update CORS in backend
cd backend/LearnLead.API
dotnet user-secrets set "AllowedOrigins" "http://localhost:5173"
dotnet run  # Restart

# Then refresh frontend
```

#### 🔴 "POST request hangs or times out"

**Cause:**
- Backend not running
- Wrong `VITE_API_BASE_URL`
- Network firewall issue

**Debug:**
```bash
# Check .env.local
cat learn-lead-academy-main/learn-lead-academy-main/.env.local
# Should show: VITE_API_BASE_URL=http://localhost:5216/api

# Test API directly
curl http://localhost:5216/api/courses

# Check network tab in browser DevTools
# (F12 → Network → see request URL)
```

**Fix:**
```bash
# Update .env.local if wrong
echo 'VITE_API_BASE_URL=http://localhost:5216/api' > .env.local

# Restart Vite dev server
npm run dev
```

#### 🔴 "Login successful but dashboard shows 'Unauthorized'"

**Cause:**
- JWT token expired
- Token not being sent in requests
- Token stored in wrong format

**Debug:**
```javascript
// Check token in localStorage (DevTools → Application)
localStorage.getItem('ll_access_token')
// Should be a long JWT string starting with "eyJ"

// Verify token format
const parts = token.split('.');
console.log(parts.length);  // Should be 3 (header.payload.signature)
```

**Fix:**
```javascript
// Manually set test token (temp for debugging)
localStorage.setItem('ll_access_token', 'your-jwt-token');

// Then check if dashboard loads
// If it does, issue is token generation
// If not, issue is token validation
```

#### 🔴 "Blank page after login"

**Cause:**
- Component rendering error
- API returning bad data
- TypeScript type mismatch

**Debug:**
```bash
# Check browser console for errors
F12 → Console → Look for red errors

# Check Network tab for failed requests
F12 → Network → Check for 4xx or 5xx responses
```

**Fix:**
```bash
# Look at React component state
# (Use React DevTools extension)

# Check API response
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5216/api/users/me

# Verify response matches expected TypeScript type
```

#### 🔴 "Video doesn't play"

**Cause:**
- Video file not uploaded correctly
- Wrong video URL stored
- YouTube URL format incorrect
- CORS issue for external videos

**Debug:**
```bash
# Check video URL in database
mongosh
db.videos.findOne({})
# Look at: storagePath, publicUrl

# Test direct video URL access
curl -I http://localhost:5216/uploads/videos/filename.mp4

# For YouTube, verify URL format
# Should be: https://www.youtube.com/watch?v=VIDEO_ID
```

**Fix:**
```bash
# Re-upload video
# Check file exists in wwwroot/uploads/videos/
ls -la backend/LearnLead.API/wwwroot/uploads/videos/

# For YouTube links, use correct format
https://www.youtube.com/watch?v=dQw4w9WgXcQ
# NOT: https://youtu.be/dQw4w9WgXcQ (unless you prefer short form)
```

### Network & Connectivity

#### 🔴 "Cannot connect to localhost:5216"

**Debug:**
```bash
# Check if port 5216 is in use
netstat -an | grep 5216

# Check if backend is running
ps aux | grep dotnet

# Try accessing health endpoint
curl http://localhost:5216/health
```

**Fix:**
```bash
# Kill process on port 5216 (if stuck)
lsof -ti:5216 | xargs kill -9

# Or use different port
# (Change in launchSettings.json)

# Restart backend
cd backend/LearnLead.API
dotnet run
```

#### 🔴 "Requests hit wrong API server"

**Debug:**
```javascript
// In browser console, check actual URL
fetch('http://localhost:5216/api/courses')
  .then(r => console.log(r.url))
```

**Fix:**
```bash
# Double-check .env.local
cat learn-lead-academy-main/learn-lead-academy-main/.env.local

# Rebuild frontend (env changes require rebuild)
npm run build
npm run preview
```

### Getting Help

**Check these resources in order:**

1. **Browser DevTools** (F12)
   - Console → Look for JavaScript errors
   - Network → Check API request/response
   - Application → Check localStorage for tokens

2. **Terminal Output**
   - Backend terminal: `dotnet run` output
   - Frontend terminal: `npm run dev` output
   - Look for stack traces and error messages

3. **Database Inspector** (MongoDB Compass)
   - Visual inspection of data
   - Verify documents are being created
   - Check data types & schema

4. **API Testing** (Postman/Insomnia)
   - Test endpoints manually
   - Check requests/responses
   - Verify authentication headers

5. **GitHub Issues** (if project open-source)
   - Search for similar issues
   - Create detailed bug report with:
     - Error message & stack trace
     - Steps to reproduce
     - Environment (OS, Node version, .NET version)
     - Screenshots

---

## 13) Project Status & Feature Completeness

### ✅ Fully Implemented Features

**Authentication & Authorization**
- [x] User registration & login with password hashing
- [x] JWT token generation & validation
- [x] Refresh token mechanism (auto-renew)
- [x] Role-based access control (Student, Admin)
- [x] Protected API endpoints with `[Authorize]`

**Course Management (Admin)**
- [x] Create, read, update, delete courses
- [x] Publish/unpublish courses
- [x] Filter courses by category
- [x] Course metadata (title, description, price, instructor)

**Lesson Management (Admin)**
- [x] Create, read, update, delete lessons
- [x] Reorder lessons (order field)
- [x] Mark lessons as free preview
- [x] Link videos to lessons

**Video Management (Admin) — DUAL UPLOAD**
- [x] File upload (stored in wwwroot/uploads)
- [x] YouTube link embedding (iframe rendering)
- [x] Video metadata tracking
- [x] Paginated video list with filtering
- [x] Delete videos & cleanup

**Student Features**
- [x] Browse courses
- [x] View course details & lessons
- [x] Enroll in courses (one-time payment)
- [x] Track progress
- [x] Watch video lessons (file or YouTube)
- [x] Access free preview lessons without enrollment

**Admin Dashboard**
- [x] Statistics overview (total courses, students, videos, revenue)
- [x] Recent enrollments feed
- [x] User management (view, suspend, activate)
- [x] Academy settings management

**Frontend UI/UX**
- [x] Responsive mobile design
- [x] Light/dark mode ready (Tailwind)
- [x] Toast notifications (Sonner)
- [x] Loading states & spinners
- [x] Form validation & error handling
- [x] SEO-friendly structure

### 🚀 Ready for Production

**Deployment Ready:**
- [x] Environment variable configuration
- [x] CORS security headers
- [x] Error handling middleware
- [x] Structured logging (Serilog)
- [x] JWT authentication
- [x] MongoDB persistence

**Scalability:**
- [x] Clean Architecture (maintainable)
- [x] Dependency injection (testable)
- [x] Async/await patterns (non-blocking)
- [x] Database indexing (queries optimized)

### 📋 Optional Enhancements (Future)

**Not critical, but nice-to-have:**
- [ ] Email notifications on enrollment
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Video progress tracking (resume where left off)
- [ ] Course recommendations engine
- [ ] Discussion forums
- [ ] Certificates of completion
- [ ] Subscription plans (vs. one-time purchase)
- [ ] Admin analytics & detailed reports
- [ ] Mobile app (React Native / Flutter)
- [ ] Search functionality (Elasticsearch)
- [ ] Caching layer (Redis)
- [ ] Real-time notifications (WebSockets)

### 📦 Deployment Ready Checklist

**Before going live:**
- [ ] Domain name registered
- [ ] SSL/TLS certificate (Let's Encrypt)
- [ ] Hosting selected & provisioned
- [ ] MongoDB backup configured
- [ ] CDN set up (for static assets)
- [ ] Monitoring & alerting enabled
- [ ] Error tracking (Sentry/Rollbar)
- [ ] Analytics installed
- [ ] Support email configured
- [ ] Terms of Service & Privacy Policy ready