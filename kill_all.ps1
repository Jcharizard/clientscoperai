# Kill all Node.js and npm processes
Write-Host "Killing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill processes using specific ports
Write-Host "Freeing up port 5001..." -ForegroundColor Yellow
$port5001 = netstat -ano | Select-String ":5001" | ForEach-Object { ($_ -split '\s+')[4] }
if ($port5001) {
    foreach ($pid in $port5001) {
        if ($pid -and $pid -ne "0") {
            Write-Host "Killing PID $pid on port 5001" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Freeing up port 5173..." -ForegroundColor Yellow
$port5173 = netstat -ano | Select-String ":5173" | ForEach-Object { ($_ -split '\s+')[4] }
if ($port5173) {
    foreach ($pid in $port5173) {
        if ($pid -and $pid -ne "0") {
            Write-Host "Killing PID $pid on port 5173" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "All processes killed and ports freed!" -ForegroundColor Green
Start-Sleep -Seconds 2 