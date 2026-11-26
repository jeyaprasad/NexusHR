# NexusHR

> **AI-Enabled Enterprise HR & Workforce Intelligence Platform**  
> *A unified architecture for the modern employee lifecycle, real-time analytics, and grounded policy assistance.*

---

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B%20%7C%20pgvector-336791?style=flat-square&logo=postgresql)](https://github.com/pgvector/pgvector)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 🌟 Overview

**NexusHR** is a production-grade Human Resource Management System (HRMS) and Workforce Intelligence platform. Built with **Spring Boot 3** and **React 19 (TanStack Start)**, NexusHR manages the end-to-end employee lifecycle while integrating modern AI capabilities:

- **AI Policy Assistant (RAG)**: Grounded question-answering on company policy documents powered by Spring AI, `pgvector` semantic search, and Groq LLM inference.
- **Predictive Workforce Intelligence**: Attrition risk analysis, skill gap assessment, and engagement scoring.
- **Core HR Operations**: Attendance tracking, leave workflow automation, payroll computation with downloadable PDF payslips, OKR goal tracking, 360° feedback, and document management.
- **Enterprise Security**: 3-tier Role-Based Access Control (`ADMIN`, `HR`, `EMPLOYEE`), stateless JWT authentication with refresh token rotation, and Redis-backed rate limiting.

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

Run the full stack (Frontend, Backend, PostgreSQL with pgvector, and Redis) with a single command:

```bash
# 1. Clone repository
git clone <repository-url>
cd NexusHR

# 2. Launch all services
docker compose up -d --build
```

| Service | Access URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | TanStack Start (React 19) SSR web interface |
| **Backend REST API** | [http://localhost:8080/api](http://localhost:8080/api) | Spring Boot 3 REST endpoints |
| **OpenAPI / Swagger UI** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | Interactive API documentation |
| **PostgreSQL Database** | `localhost:5432` | Primary database (`nexushr` db with `pgvector`) |
| **Redis Cache** | `localhost:6379` | Distributed session cache & rate limiting |

To stop and reset all container volumes:
```bash
docker compose down -v
```

---

### Option 2: Local Development Setup

#### Backend (Spring Boot 3 + Java 21)
Prerequisites: JDK 21+, Maven 3.9+, PostgreSQL with pgvector, and Redis running.

```bash
cd backend
./mvnw clean spring-boot:run
```

#### Frontend (React 19 + TanStack Start)
Prerequisites: Node.js 20+ and npm / bun.

```bash
cd frontend
npm install
npm run dev
```
The frontend dev server will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Access Credentials

The database seeds three default evaluation accounts on initialization:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@nexushr.com` | `admin123` | Full system access, user administration, system logs |
| **HR** | `hr@nexushr.com` | `hr123` | Employee lifecycle, payroll, attendance, leave approval, reviews |
| **EMPLOYEE** | `employee@nexushr.com` | `employee123` | Self-service profile, attendance check-in, leave application, payslips |

*Demo credentials can also be auto-populated directly from the sign-in page.*

---

## 🏗️ System Architecture

```
NexusHR/
├── backend/                       # Spring Boot 3 REST API (Java 21)
│   ├── src/main/java/com/zidio/nexushr/
│   │   ├── config/                # Security, Redis, CORS, Flyway, Seeder
│   │   ├── controller/            # REST API Controllers (Auth, Employees, Leaves, Payroll, AI, etc.)
│   │   ├── dto/                   # Request/Response Data Transfer Objects
│   │   ├── entity/                # JPA Entities (Employee, Leave, Attendance, Goal, etc.)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── security/              # JWT Filters, UserDetailsService, Rate Limiting
│   │   └── service/               # Core Business Logic & AI Services
│   ├── src/main/resources/
│   │   ├── db/migration/          # Flyway SQL schema migrations (V1 to V9)
│   │   └── application.yml        # Application configuration
│   └── pom.xml
│
├── frontend/                      # React 19 Frontend (TanStack Start & Router)
│   ├── src/
│   │   ├── components/            # Layout, Navigation, Header, ChatWidget
│   │   ├── routes/                # File-based routes (Dashboard, Employees, Payroll, etc.)
│   │   ├── lib/                   # API client, Auth helpers, Mock fallback
│   │   └── styles.css             # Tailwind CSS v4 design tokens
│   ├── package.json
│   └── vite.config.ts
│
├── infra/                         # Production Infrastructure
│   ├── k8s/                       # Kubernetes deployment manifests
│   └── helm/                      # Helm chart configurations
│
├── docker-compose.yml             # Orchestration configuration
└── README.md
```

---

## ⚙️ Key Modules & Capabilities

- **Employee Lifecycle Management**: Complete employee directory with profile editing, document upload (degrees, certifications), and role assignment.
- **Attendance & Time Tracking**: Daily check-in/out logging, overtime calculation, late penalty tracking, and automated daily processing.
- **Leave Management**: Accrued leave balances (30 days standard), approval workflows, half-day leave options, and conflict validation.
- **Automated Payroll Engine**: Net pay computation based on base salary, allowances, and statutory deductions with server-side OpenPDF payslip generation.
- **Goals & OKR Tracking**: Departmental and individual objective tracking with progress percentage metrics.
- **360° Continuous Feedback**: Peer, manager, and subordinate review cycles with structured evaluation criteria.
- **HR Policy Assistant (RAG)**: Chatbot grounded in company policies utilizing vector embeddings (`pgvector`) and Groq LLM inference, with guardrails for sensitive topic escalation.
- **Workforce Intelligence**: Enterprise-wide attrition risk heatmaps, skill gap analysis, and engagement diagnostics.
- **Data Portability**: One-click CSV exports for employees, attendance, payroll, leaves, and performance data.

---

## 🛡️ Security & Reliability

- **Authentication & Authorization**: Stateless JWT (HS512) with refresh tokens and strict `@PreAuthorize` method security matching the 3-role model.
- **Rate Limiting**: Redis-backed token bucket algorithm protecting authentication and AI endpoints.
- **Fault Tolerance**: Resilience4j circuit breakers with automatic fallback handling.
- **Database Migrations**: Version-controlled Flyway migrations ensuring repeatable, consistent schemas.
- **Auditing**: AOP-based audit logging for critical administrative and financial operations.

---

## 📜 Configuration Reference

Environment variables can be configured in `docker-compose.yml` or a local `.env` file:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` (or `dev`) |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection string | `jdbc:postgresql://db:5432/nexushr` |
| `SPRING_DATA_REDIS_HOST` | Redis cache hostname | `redis` |
| `APP_JWT_SECRET` | 256-bit+ secret key for JWT signing | *Development default provided* |
| `GROQ_API_KEY` | Groq Cloud API key for LLM inference | `mock-key` (falls back to local responses) |
| `SENTRY_DSN` | Sentry DSN for error monitoring | *Optional* |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
