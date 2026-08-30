Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Now open TWO terminals and run:" -ForegroundColor Yellow
Write-Host "  Terminal 1: cd backend  then  npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd frontend then  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Green
