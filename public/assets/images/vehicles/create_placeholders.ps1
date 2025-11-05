# Script tạo placeholder ảnh SVG cho các xe chưa có ảnh

$vehicles = @(
    @{Name="VinFast VF 5 Plus"; File="vinfast-vf5.png"; Color="#1e3a8a"},
    @{Name="VinFast VF e34"; File="vinfast-e34.png"; Color="#1e3a8a"},
    @{Name="Tesla Model 3"; File="tesla-model3.png"; Color="#dc2626"},
    @{Name="Tesla Model Y"; File="tesla-modely.png"; Color="#dc2626"},
    @{Name="Tesla Model S"; File="tesla-models.png"; Color="#dc2626"},
    @{Name="BYD Atto 3"; File="byd-atto3.png"; Color="#059669"},
    @{Name="BYD Seal"; File="byd-seal.png"; Color="#059669"},
    @{Name="Hyundai Ioniq 5"; File="hyundai-ioniq5.png"; Color="#2563eb"},
    @{Name="Kia EV6"; File="kia-ev6.png"; Color="#7c3aed"}
)

$outputDir = "C:\FPT\SWP2\FE\EV-Service-Center-Maintenance-Management-System---FE\public\assets\images\vehicles"

foreach ($vehicle in $vehicles) {
    $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f9fafb"/>
  <g transform="translate(100, 200)">
    <path d="M50 100 L150 50 L450 50 L550 100 L550 180 L50 180 Z" 
          fill="$($vehicle.Color)" stroke="#1f2937" stroke-width="2" opacity="0.8"/>
    <path d="M150 50 L200 20 L400 20 L450 50" 
          fill="$($vehicle.Color)" stroke="#111827" stroke-width="2" opacity="0.9"/>
    <rect x="180" y="30" width="80" height="30" fill="#e0e7ff" opacity="0.4"/>
    <rect x="340" y="30" width="80" height="30" fill="#e0e7ff" opacity="0.4"/>
    <circle cx="150" cy="180" r="40" fill="#1f2937"/>
    <circle cx="450" cy="180" r="40" fill="#1f2937"/>
    <circle cx="150" cy="180" r="20" fill="#6b7280"/>
    <circle cx="450" cy="180" r="20" fill="#6b7280"/>
    <path d="M320 80 L300 110 L315 110 L295 140 L325 105 L310 105 Z" 
          fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
  </g>
  <text x="400" y="450" font-family="Arial" font-size="36" font-weight="bold"
        fill="#1f2937" text-anchor="middle">$($vehicle.Name)</text>
  <text x="400" y="490" font-family="Arial" font-size="20" 
        fill="#6b7280" text-anchor="middle">Placeholder - Cần thay ảnh thật</text>
</svg>
"@

    $outputPath = Join-Path $outputDir $vehicle.File.Replace(".png", "-placeholder.svg")
    $svgContent | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "✓ Created: $($vehicle.File)" -ForegroundColor Green
}

Write-Host "`n✅ Done! Created placeholder SVGs" -ForegroundColor Green
Write-Host "📁 Location: $outputDir" -ForegroundColor Cyan
Write-Host "`n⚠️  Remember to replace these with real car photos!" -ForegroundColor Yellow
