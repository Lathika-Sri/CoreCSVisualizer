# CoreCS Visualizer · MERN

The existing Next.js frontend screens, component structure and visual theme are kept. The backend has been replaced with an Express API and MongoDB persistence.

## Requirements

- Node.js 20 or newer and npm
- MongoDB Community Server, or a MongoDB Atlas connection string

## Run locally

1. Copy `apps/api/.env.example` to `apps/api/.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
2. Install dependencies from this folder: `npm install`.
3. Start the API and web app together: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000). The API runs on port 5000.

Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` if the API is hosted at a different URL. Set `FRONTEND_URL` in `apps/api/.env` to the exact web origin when it is not `http://localhost:3000`.

## Features

- React and Next.js frontend, Express REST API, MongoDB/Mongoose storage
- JWT based register, login, current-session and logout endpoints; passwords are stored as bcrypt hashes
- FCFS, SJF, SRTF, Priority and Round Robin CPU scheduling with timeline and process metrics
- MiniDB SQL teaching engine for CREATE, INSERT, SELECT, UPDATE and DELETE; its educational tables are held in memory and reset when the API restarts
- Java source SOLID analyzer with class facts, dependency links and heuristic SRP/OCP/LSP/ISP/DIP signals
- MongoDB saved-query collection and CRUD endpoints

## API routes

All routes are prefixed by `/api`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Service status |
| POST | `/auth/register`, `/auth/login` | Create session |
| GET | `/auth/me`, POST `/auth/logout` | Session management |
| POST | `/cpu/simulate` | Run a CPU scheduling simulation |
| POST | `/db/query` | Execute MiniDB SQL |
| POST | `/solid/analyze` | Analyze Java source |
| GET/POST | `/saved-queries` | List and save SQL snippets |
| DELETE | `/saved-queries/:id` | Delete saved SQL snippet |

The SOLID analyzer is a source-level heuristic port of the original JavaParser based analyzer. It reports design review signals and is not a full Java compiler or AST implementation.
