# Script test nhanh cac file anh

Write-Host "KIEM TRA HE THONG ANH XE" -ForegroundColor Cyan
Write-Host ""

# 1. Kiem tra file ton tai
Write-Host "1. Kiem tra files trong thu muc vehicles:" -ForegroundColor Yellow
$vehiclesPath = "C:\FPT\SWP2\FE\EV-Service-Center-Maintenance-Management-System---FE\public\assets\images\vehicles"

if (Test-Path $vehiclesPath) {
    Write-Host "Thu muc vehicles ton tai" -ForegroundColor Green
    
    $files = Get-ChildItem $vehiclesPath -Filter "*.png"
    Write-Host ""
    Write-Host "Cac file PNG:" -ForegroundColor Cyan
    foreach ($file in $files) {
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        Write-Host "  $($file.Name) - ${sizeKB} KB" -ForegroundColor Green
    }
} else {
    Write-Host "Thu muc vehicles KHONG ton tai!" -ForegroundColor Red
}

# 2. Test URL anh (neu frontend dang chay)
Write-Host ""
Write-Host "2. Test URL anh:" -ForegroundColor Yellow
$urls = @(
    "http://localhost:3000/assets/images/vehicles/vinfast-vf8.png",
    "http://localhost:3000/assets/images/vehicles/vinfast-vf9.png"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  $url - OK (200)" -ForegroundColor Green
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "  $url - NOT FOUND (404)" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*Unable to connect*") {
            Write-Host "  Frontend khong chay (localhost:3000)" -ForegroundColor Yellow
            break
        } else {
            Write-Host "  $url - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 3. Kiem tra backend co chay khong
Write-Host ""
Write-Host "3. Kiem tra Backend:" -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/vehicle-models" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  Backend dang chay (port 8080)" -ForegroundColor Green
} catch {
    Write-Host "  Backend KHONG chay hoac khong co endpoint /api/v1/vehicle-models" -ForegroundColor Red
}

# 4. Goi y
Write-Host ""
Write-Host "GOI Y:" -ForegroundColor Cyan
Write-Host "  1. Neu URL anh tra ve 404:" -ForegroundColor White
Write-Host "     Kiem tra ten file trong thu muc vehicles/" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Neu Backend khong chay:" -ForegroundColor White
Write-Host "     Restart backend trong IntelliJ" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Neu Frontend khong chay:" -ForegroundColor White
Write-Host "     Chay: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Sau khi fix, nho:" -ForegroundColor White
Write-Host "     Hard refresh browser (Ctrl+Shift+R)" -ForegroundColor Gray

Write-Host ""
Write-Host "Hoan thanh kiem tra!" -ForegroundColor Green
