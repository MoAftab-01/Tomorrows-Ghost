# Tomorrow's Ghost — Stage 1 Foundation

**Working directory verified:** E:\placement_personal\Projects\Tomorrows-Ghost  
**Branch:** main (initialized in target directory only)  
**No commits or pushes yet — awaiting user approval**

## Services
- Frontend: `http://127.0.0.1:5174` (reserved port)
- Backend: `http://127.0.0.1:8002` (reserved port — does not conflict with 8000)
- Ollama: `http://127.0.0.1:11434` (existing — not restarted)

## Quick Start
```powershell
cd E:\placement_personal\Projects\Tomorrows-Ghost
# Backend
backend/venv/Scripts/uvicorn.exe app.main:app --host 0.0.0.0 --port 8002 --app-dir backend
# Frontend
npm run dev -- --port 5174 --host
```

## Health Check
```powershell
.\scripts\health-check.ps1
```

## Synthetic Fixtures (safe to commit)
- `backend/data/synthetic/fixture_memory_2016.md`

## Excluded from Git
- Real user uploads, `.env`, `.claude/`, `node_modules/`, `logs/`, `uploads/`, `data/user/`, `backend/*.db`

See `.gitignore` and `STAGE_0_CORRECTED.md` for full details.
