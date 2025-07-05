# AGGRESSIVE ClientScopeAI Process Killer
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "AGGRESSIVE PROCESS CLEANUP STARTING..." -ForegroundColor Yellow  
Write-Host "========================================" -ForegroundColor Yellow

# Kill all Node.js processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill all CMD windows with ClientScope in title
Write-Host "Killing ClientScope CMD windows..." -ForegroundColor Cyan
Get-Process | Where-Object { $_.MainWindowTitle -like "*ClientScope*" } | Stop-Process -Force

# Kill processes using ports 5001 and 5173
Write-Host "Freeing ports 5001 and 5173..." -ForegroundColor Cyan
$ports = @(5001, 5173)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            Write-Host "Killing process $($conn.OwningProcess) using port $port" -ForegroundColor Red
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Port not in use, continue
    }
}

# Alternative method using netstat for stubborn processes
Write-Host "Double-checking with netstat..." -ForegroundColor Cyan
$netstatOutput = netstat -ano | Select-String ":5001|:5173"
foreach ($line in $netstatOutput) {
    $parts = $line.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
    if ($parts.Length -gt 4) {
        $processId = $parts[-1]
        try {
            Write-Host "Force killing PID $processId" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        } catch {
            # Process already dead
        }
    }
}

# Kill any remaining npm/node processes that might be hanging
Write-Host "Final cleanup of npm/node processes..." -ForegroundColor Cyan
taskkill /f /im node.exe 2>$null
taskkill /f /im npm.exe 2>$null

# Wait for processes to fully terminate
Write-Host "Waiting for processes to terminate..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Verify ports are free
Write-Host "Verifying ports are free..." -ForegroundColor Green
$port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port5001) {
    Write-Host "WARNING: Port 5001 still in use!" -ForegroundColor Red
} else {
    Write-Host "✓ Port 5001 is free" -ForegroundColor Green
}

if ($port5173) {
    Write-Host "WARNING: Port 5173 still in use!" -ForegroundColor Red  
} else {
    Write-Host "✓ Port 5173 is free" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "AGGRESSIVE CLEANUP COMPLETE!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow 