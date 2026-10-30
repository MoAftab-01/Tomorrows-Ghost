# Health check — read-only inspection, does not modify services
$ports = @(
    @{port=5174; name="Frontend"; url="http://127.0.0.1:5174/"},
    @{port=8002; name="Backend"; url="http://127.0.0.1:8002/health"},
    @{port=11434; name="Ollama"; url="http://127.0.0.1:11434/api/ps"}
)
$results = @()
$errors = 0
foreach ($p in $ports) {
    try {
        $resp = Invoke-WebRequest -Uri $p.url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $status = "OK (HTTP $($resp.StatusCode))"
    } catch {
        $status = "NOT RESPONDING"
        $errors++
    }
    $results += [PSCustomObject]@{
        Service = $p.name
        Port = $p.port
        Status = $status
        URL = $p.url
    }
}
$results | Format-Table -AutoSize
if ($errors -gt 0) {
    Write-Host "FAILURES: $errors service(s) not responding." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All services healthy." -ForegroundColor Green
}
