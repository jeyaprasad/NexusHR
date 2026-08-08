# Running Locally (Cheat Sheet)

This is the fastest path to get the application running for day-to-day development or a live demo.

## 1. Start the Application
Run the minimal, 4-container stack (Frontend, Backend, Postgres, Redis):
```bash
docker compose up -d --build
```
*(This deliberately excludes the heavy Grafana/Prometheus containers. To run those, see the main `README.md`)*

## 2. Default Login
The database automatically seeds three default users for each role on startup:
- **ADMIN**: `admin@insiihr.com` / `admin123`
- **HR**: `hr@insiihr.com` / `hr123`
- **EMPLOYEE**: `employee@insiihr.com` / `employee123`

## 3. Important URLs
- **Frontend App (Login here):** [http://localhost:3000](http://localhost:3000)
- **API Swagger Docs:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Direct Backend API:** `http://localhost:8080/api`

## Production Infrastructure Note
The Kubernetes (`k8s/`), Helm (`helm/`), and Telemetry configs (Grafana/Prometheus) in this repository are for **production deployment reference only**. You do not need to use them to run or demo the app locally. See the main `README.md` for full details.
