# Start dev services (do not terminate unrelated services)
Write-Host "Starting Tomorrow's Ghost Stage 1 development..."

# Verify Ollama is running (do not start another)
try {
    $ollama = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/ps" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "Ollama: running at localhost:11434"
} catch {
    Write-Host "Ollama: NOT RESPONDING — please ensure ollama serve is running." -ForegroundColor Yellow
}

# Start backend (port 8002 — reserved, not 8000)
Write-Host "Starting backend on 8002..."
$back = Start-Process -FilePath "E:\placement_personal\Projects\Tomorrows-Ghost\backend\venv\Scripts\uvicorn.exe" -ArgumentList "app.main:app","--host","0.0.0.0","--port","8002","--app-dir","E:\placement_personal\Projects\Tomorrows-Ghost\backend" -PassThru
Write-Host "Backend PID: $($back.Id)"

# Start frontend (port 5174 — reserved, not 5173)
Write-Host "Starting frontend on 5174..."
$front = Start-Process -FilePath "npm" -ArgumentList "run","dev","--","--port","5174","--host" -WorkingDirectory "E:\placement_personal\Projects\Tomorrows-Ghost\frontend" -PassThru
Write-Host "Frontend PID: $($front.Id)"
Write-Host "Services starting. Verify with: http://127.0.0.1:5174/ and http://127.0.0.1:8002/health"
