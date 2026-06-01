# 🔧 TelecomIQ – AI-Driven Incident & Ticket Resolution Platform

A production-quality enterprise telecom support platform that combines **Spring Boot**, **Angular**, **FastAPI**, **LLMs**, **RAG**, **PostgreSQL**, **Docker**, and **CI/CD**.

The system simulates how large telecom companies manage customer incidents, support tickets, network outages, authentication issues, billing issues, and service requests — powered by intelligent AI workflows with human-in-the-loop escalation.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│   Angular 19    │────▶│  Spring Boot 3 API   │────▶│   FastAPI AI Service │
│  Material UI    │     │  JWT + Spring Sec    │     │  LangChain + FAISS   │
│   Chart.js      │     │  JPA + PostgreSQL    │     │  Groq (Llama 3.3)    │
└─────────────────┘     └─────────────────────┘     └──────────────────────┘
                              │                              │
                              ▼                              ▼
                        ┌───────────┐              ┌─────────────────┐
                        │PostgreSQL │              │ Knowledge Base  │
                        │ Supabase  │              │ FAISS Vectors   │
                        └───────────┘              └─────────────────┘
```

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Ticket Classification | Auto-categorizes tickets (Network, Billing, Auth, Hardware, Service) |
| 🎯 AI Priority Prediction | Predicts Low/Medium/High/Critical with confidence scores |
| 📚 RAG Resolution Engine | Generates step-by-step resolutions from telecom knowledge base |
| 🔄 Human-in-the-Loop | "AI Solution Didn't Help" button escalates to human engineers |
| ⚡ Auto-Escalation | Low AI confidence (<70%) or Critical priority auto-escalates |
| 📧 Email Notifications | Gmail SMTP alerts for critical tickets, escalations, resolutions |
| 📊 Analytics Dashboard | Chart.js visualizations with real-time ticket metrics |
| 🔐 JWT Authentication | BCrypt + JWT with role-based access (Customer/Engineer/Admin) |
| 🐳 Docker Compose | One-command deployment of all 4 services |
| 🚀 CI/CD | GitHub Actions for build, test, and Docker image creation |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, Angular Material, RxJS, Chart.js |
| Backend | Java 21, Spring Boot 3.3, Spring Security 6, JPA |
| AI Service | Python 3.11, FastAPI, LangChain, FAISS, Groq API |
| Database | PostgreSQL 16 (Supabase compatible) |
| DevOps | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Groq API Key ([console.groq.com](https://console.groq.com))

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url> && cd TelecomIQ

# 2. Create .env file from template
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Launch all services
docker-compose up --build

# 4. Access the platform
# Frontend: http://localhost
# Backend API: http://localhost:8080
# AI Service: http://localhost:8000
# Swagger: http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
# Set environment variables or edit application.yml
mvn spring-boot:run
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
# Set GROQ_API_KEY environment variable
python scripts/load_documents.py   # Build FAISS index
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
ng serve   # http://localhost:4200
```

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Register, Login, Create Ticket, View Status, View AI Suggestions, Escalate |
| **Engineer** | View Assigned Tickets, Update Status, Add Comments, Resolve Tickets |
| **Admin** | Manage Users, Manage Engineers, View Analytics, All Tickets, Escalations |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/users` | Get all users (Admin) |
| POST | `/api/tickets` | Create ticket (triggers AI) |
| GET | `/api/tickets` | List tickets (role-filtered) |
| GET | `/api/tickets/{id}` | Get ticket details |
| PUT | `/api/tickets/{id}` | Update ticket status |
| POST | `/api/tickets/{id}/escalate` | Escalate ticket |
| POST | `/api/comments` | Add comment |
| GET | `/api/comments/{ticketId}` | Get comments |
| GET | `/api/dashboard/stats` | Dashboard analytics |

Full API documentation: [Swagger UI](http://localhost:8080/swagger-ui.html)

## 📁 Project Structure

```
TelecomIQ/
├── backend/                  # Spring Boot 3 API
│   ├── src/main/java/com/telecomiq/
│   │   ├── config/          # Security, JWT, CORS, Swagger
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA Entities
│   │   ├── enums/           # Role, Status, Category, Priority
│   │   ├── exception/       # Global Exception Handling
│   │   ├── repository/      # Spring Data JPA
│   │   └── service/         # Business Logic
│   └── pom.xml
├── frontend/                 # Angular 19 App
│   └── src/app/
│       ├── core/            # Services, Guards, Interceptors
│       ├── features/        # Auth, Dashboard, Tickets, Admin
│       └── shared/          # Models, Components
├── ai-service/              # FastAPI + RAG
│   ├── app/
│   │   ├── api/             # FastAPI Routes
│   │   ├── rag/             # FAISS Ingestion & Retrieval
│   │   └── services/        # Classification, Priority, Resolution
│   └── knowledge_base/      # Telecom KB Documents
├── docker/                  # Dockerfiles
├── .github/workflows/       # CI/CD Pipelines
├── docker-compose.yml
└── docs/                    # Documentation
```

## 📄 License

This project is built for portfolio and educational purposes.
