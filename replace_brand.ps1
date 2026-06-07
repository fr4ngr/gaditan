$files = @(
    "src\components\Footer.astro",
    "src\components\Reserva.astro",
    "src\layouts\Layout.astro",
    "public\js\components.js",
    "public\js\config.js",
    "public\js\mapManager.js",
    "public\js\ui.js"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = Get-Content $f -Raw -Encoding UTF8
        $content = $content -replace 'Radio Taxi Cádiz', 'servicio oficial de taxis'
        $content = $content -replace 'Radio Taxi', 'Taxis Oficiales'
        $content = $content -replace '>RT<', '>TO<'
        Set-Content $f -Value $content -Encoding UTF8
        Write-Host "Updated $f"
    }
}
