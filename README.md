# InsiiHR

> **Enterprise HR, Intelligence-First**
>
> _The unified architecture for the modern employee lifecycle._


[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**InsiiHR** is a production-grade, AI-enabled, full-stack HR management platform built on Java 21 and React 19. It manages the complete employee lifecycle — from onboarding to offboarding — with real-time analytics, predictive attrition modeling, automated payroll, and granular RBAC security.

---



## 🚀 Quick Start (Docker Desktop)

For the fastest day-to-day development and demo path, see [RUNNING_LOCALLY.md](docs/RUNNING_LOCALLY.md).

The entire application — backend, frontend, PostgreSQL, and Redis — runs with a **single command**:

```bash
git clone <repo-url>
cd Zidio
docker compose up -d --build
```

| Service | URL | Description |
| :------ | :-- | :---------- |
| Frontend | http://localhost:3000 | TanStack Start SSR Dev Server |
| Backend API | http://localhost:8080/api | Spring Boot REST API |
| Swagger UI | http://localhost:8080/swagger-ui/index.html | Interactive API Docs |
| PostgreSQL | localhost:5432 | Primary Database (`insiihr` db) |
| Redis | localhost:6379 | Cache & Rate Limiter |

*(Note: Grafana and Prometheus are included for observability but are disabled by default to save resources. To run them, use `docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d`)*

> **Default Access** — The database automatically seeds three default users for each role on startup:
> - **ADMIN**: `admin@insiihr.com` / `admin123`
> - **HR**: `hr@insiihr.com` / `hr123`
> - **EMPLOYEE**: `employee@insiihr.com` / `employee123`

To reset all data:
```bash
docker compose down -v   # removes volumes
docker compose up --build
```

---

## ✅ Feature Modules

| ID | Module | Status | Description |
| :--- | :--- | :--- | :--- |
| **F-01** | Employee Lifecycle Management | ✅ Complete | Onboarding to offboarding with complete historical audit trails |
| **F-02** | Attendance & Leave Management | ✅ Complete | Real-time time tracking, geo-fencing, automated policy enforcement |
| **F-03** | Payroll Engine | ✅ Complete | Statutory compliance, tax computations, downloadable PDF payslips |
| **F-04** | Performance Reviews | ✅ Complete | 360° reviews, OKR tracking, continuous feedback loops |
| **F-05** | AI Attrition Insights | ✅ Complete | Predictive modeling via Groq (Spring AI, openai/gpt-oss-20b) - *Prompt-based LLM generation* |
| **F-06** | AI HR Policy RAG | ✅ Complete | Grounded Q&A on company policies using vector embeddings (pgvector) and Spring AI - *Retrieval-Augmented Generation* |
| **F-07** | Dashboard & Workforce Intel | ✅ Complete | Real-time stats with role-based analytics and drill-down reports |
| **F-08** | Notifications | ✅ Complete | Event-driven pub/sub via WebSocket for critical HR alerts |
| **F-09** | Auth & RBAC | ✅ Complete | JWT (HS512) + refresh rotation, row-level security, field permissions |
| **F-10** | Dark/Light Theme | ✅ Complete | Client-side toggle persisted per session |

---

## 🏗️ Architecture

```
InsiiHR/
├── backend/                                 # Spring Boot Backend
│   ├── src/main/java/com/zidio/insiihr/     
│   │   ├── controller/                      # REST endpoints
│   │   ├── service/                         # Business logic layer
│   │   ├── entity/                          # JPA entities
│   │   ├── repository/                      # Spring Data JPA repositories
│   │   ├── security/                        # JWT filter, UserDetailsService
│   │   └── config/                          # Security, CORS, Redis, WebSocket
│   ├── Dockerfile                           # Backend multi-stage image
│   └── pom.xml                              # Maven build (Spring Boot 3.3)
│
├── frontend/                                # React 19 Frontend (TanStack Start)
│   └── src/
│       ├── routes/                          # File-based routing (pages)
│       ├── components/                      # Radix UI / shadcn/ui components
│       ├── lib/                             # Utilities (api client, auth, cn)
│       └── styles.css                       # TailwindCSS v4 global styles
│
├── docs/                                    # Documentation
│   ├── RUNNING_LOCALLY.md
│   └── HR_CHATBOT_DEEPDIVE.md
│
├── infra/                                   # Infrastructure & Orchestration
│   ├── k8s/                                 # Kubernetes manifests
│   └── helm/                                # Helm chart
│
├── grafana/                                 # Grafana dashboard configs
├── prometheus/                              # Prometheus scrape config
└── docker-compose.yml                       # Local orchestration
```

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Runtime** | Java 21 | LTS, virtual threads ready |
| **Framework** | Spring Boot 3.3 | REST API, auto-configuration |
| **AI / ML** | Spring AI 1.0 + Groq (chat) + pgvector (vector store) + ONNX (embeddings) | Attrition prediction, HR Policy RAG (HuggingFace used separately for sentiment analysis) |
| **Database** | PostgreSQL 17 | ACID, encrypted at rest |
| **Migrations** | Flyway | Production-safe schema migrations |
| **Cache** | Redis 7 | Session cache + rate limiting |
| **Auth** | Spring Security 6 + JJWT 0.12 (HS512) | Stateless JWT, RBAC |
| **PDF** | OpenPDF 2.0 (iText fork) | Server-side payslip generation |
| **WebSocket** | Spring WebSocket (STOMP) | Real-time push notifications |
| **Email** | Spring Mail | Event-triggered notifications |
| **Observability** | Micrometer + Prometheus | JVM & app metrics |
| **Error Tracking** | Sentry 8 | Exception monitoring |
| **Resilience** | Resilience4j 2.2 | Circuit breaker, retry, rate limiter |
| **API Docs** | SpringDoc OpenAPI 2.6 | Swagger UI |
| **ORM** | Spring Data JPA + Hibernate | Schema managed via Flyway |
| **Build** | Maven (mvnw) | Multi-stage Docker build |

### Frontend
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript 5.8 | Server-side rendering (SSR) |
| **Router / SSR** | TanStack Start + TanStack Router | File-based routing, full-stack |
| **Server** | Vite 8 + Nitro | Dev server & SSR adapter |
| **Styling** | TailwindCSS v4 | Utility-first, custom design tokens |
| **UI Components** | shadcn/ui + Radix UI | Accessible, headless primitives |
| **Forms** | React Hook Form 7 + Zod 3 | Schema validation |
| **Charts** | Recharts 2 | Workforce analytics visualizations |
| **Data Fetching** | TanStack Query 5 | Server-state caching |
| **Date Handling** | date-fns 4 | Calendar & leave date logic |
| **Icons** | Lucide React | Consistent icon set |
| **Toasts** | Sonner 2 | Notification toasts |
| **Package Manager** | Bun | Fast installs & bundling |

### Infrastructure
| Component | Technology |
| :-------- | :--------- |
| **Containerization** | Docker (multi-stage hardened images) |
| **Orchestration** | Docker Compose (local) / Kubernetes (prod) |
| **Helm** | Helm chart for K8s deployments |

| **CI/CD** | GitHub Actions with security scans |
| **Monitoring** | Prometheus + Grafana |

---

## 🔌 API Reference

All endpoints require `Authorization: Bearer <token>` except auth routes.
Interactive docs: **`http://localhost:8080/swagger-ui/index.html`**

### Authentication
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/api/auth/register` | Register new user (returns JWT) |
| `POST` | `/api/auth/login` | Sign in → returns access + refresh token |

### Employees
| Method | Endpoint | Role Required |
| :----- | :------- | :------------ |
| `GET` | `/api/employees` | Any authenticated |
| `GET` | `/api/employees/{id}` | Any authenticated |
| `POST` | `/api/employees` | ADMIN / HR |
| `PUT` | `/api/employees/{id}` | ADMIN / HR |
| `DELETE` | `/api/employees/{id}` | ADMIN |

### Attendance
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/attendance` | All records (ADMIN / HR) |
| `POST` | `/api/attendance` | Mark attendance |
| `PUT` | `/api/attendance/{id}` | Update record |
| `DELETE` | `/api/attendance/{id}` | Delete (ADMIN / HR) |

### Leave Management
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/leaves` | All requests (ADMIN / HR) |
| `POST` | `/api/leaves` | Apply for leave (balance validated) |
| `PUT` | `/api/leaves/{id}/status?status=APPROVED` | Approve / Reject |
| `DELETE` | `/api/leaves/{id}` | Delete (ADMIN) |

### Payroll
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/payroll` | All payrolls (ADMIN / HR) |
| `POST` | `/api/payroll` | Create payroll (net auto-calculated) |
| `PUT` | `/api/payroll/{id}` | Update payroll |
| `GET` | `/api/payroll/{id}/pdf` | Download PDF payslip |
| `DELETE` | `/api/payroll/{id}` | Delete (ADMIN) |

### Performance Reviews
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/performance` | All reviews (ADMIN / HR) |
| `POST` | `/api/performance` | Submit review |
| `PUT` | `/api/performance/{id}` | Update review |
| `DELETE` | `/api/performance/{id}` | Delete (ADMIN) |

### Dashboard
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/dashboard/stats` | Real-time workforce stats |

### AI Insights
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/api/ai/attrition` | Predict attrition risk for an employee (ADMIN / HR) |
| `POST` | `/api/ai/skill-gap` | Identify skill gaps for an employee (ADMIN / HR) |
| `POST` | `/api/ai/engagement` | Analyze employee engagement and sentiment (ADMIN / HR) |
| `POST` | `/api/ai/ask-hr` | RAG-based grounded/retrieval-augmented HR policy Q&A |
| `POST` | `/api/ai/policy-upload` | Admin endpoint to upload and index HR policy documents into pgvector (ADMIN) |

### Notifications
| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/api/notifications` | Fetch recent notifications |
| WebSocket | `/ws` (STOMP) | Subscribe to real-time HR alerts |

---

## 💡 Business Logic Highlights

- **Payroll**: Net salary = Basic + Allowances − Deductions (auto-calculated on creation)
- **Leave Balance**: 30 days default per employee; deducted on approval, restored on rejection/cancellation
- **PDF Payslips**: Generated server-side with OpenPDF, streamed directly to the browser
- **Generative AI Features**:
  - **Prompt-Based (Attrition/Skills)**: Groq inference via Spring AI — flags flight-risk employees before vacancies occur and identifies skill gaps. Uses explicit fallback simulation when `GROQ_API_KEY` is not provided.
  - **RAG-Based (HR Policy Q&A)**: Uses `pgvector` for vector storage and `spring-ai-transformers` (Local ONNX Models) to embed uploaded HR policies (PDF/Text) locally. Provides highly accurate, grounded answers to employee queries. Automatically downloads the ONNX model (approx. 200MB) on first run.
- **RBAC Hierarchy**:
  - `ADMIN` — full platform access
  - `HR` — employee, payroll, attendance management, approve leaves & submit performance reviews
  - `EMPLOYEE` — view own data only
- **Resilience**: Resilience4j circuit breaker wraps external HuggingFace calls with automatic fallback
- **Schema Migrations**: Flyway replaces `ddl-auto: update` for deterministic, production-safe migrations
- **Audit Trail**: AOP-based audit logging for all state-changing operations

---

## 📦 Docker Compose Services

```yaml
services:
  db:       PostgreSQL 17  (port 5432)  — primary datastore
  redis:    Redis 7        (port 6379)  — cache & rate limiter
  backend:  Spring Boot    (port 8080)  — REST API
  frontend: TanStack Start (port 3000)  — SSR frontend
```
*(Grafana and Prometheus are available via `docker-compose.observability.yml`)*



## ☸️ Production Deployment Reference (not required to run locally)

Kubernetes manifests and a Helm chart are available under `k8s/` and `helm/` for production cluster deployments:

```bash
helm install insiihr ./helm --namespace insiihr --create-namespace
```

---

## 📊 Platform Metrics

*Illustrative targets based on the platform's design capacity, not live production measurements.*

| Metric | Value |
| :----- | :---- |
| Employee Records Managed | 12k+ |
| System Uptime | 99.9% |
| HR Overhead Reduction | 40% |
| Average API Latency | < 200ms |

---

## 🔐 Security

- **OWASP Hardened**: XSS, CSRF, and SQLi protection
- **JWT with Refresh Rotation**: Stateless, short-lived access tokens
- **Redis Rate Limiting**: Per-IP and per-user request throttling
- **PostgreSQL Encryption**: Data encrypted at rest
- **Sentry Integration**: Real-time error monitoring and alerting
- **Docker**: Multi-stage, hardened, minimal production images
- **CI/CD**: GitHub Actions pipeline with dependency vulnerability scans

---

© 2026 InsiiHR Platform · Enterprise Edition v4.2.0
