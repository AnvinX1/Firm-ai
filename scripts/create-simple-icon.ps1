# Create a simple square icon using PowerShell and .NET
# This creates a minimal 1024x1024 PNG icon

$iconDir = Join-Path $PSScriptRoot "..\src-tauri\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

# Create a simple 1024x1024 PNG using .NET
Add-Type -AssemblyName System.Drawing

$size = 1024
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Fill with a gradient (red accent to match theme)
# Primary color: hsl(350, 89%, 46%) ≈ rgb(217, 23, 23)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($size, $size),
    [System.Drawing.Color]::FromArgb(217, 23, 23),  # Primary red
    [System.Drawing.Color]::FromArgb(150, 15, 15)   # Darker red
)
$graphics.FillRectangle($brush, 0, 0, $size, $size)

# Add a simple "F" letter in white
$font = New-Object System.Drawing.Font("Arial", 600, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString("F", $font, $textBrush, 200, 150)

$graphics.Dispose()

# Save as PNG files
$bitmap.Save((Join-Path $iconDir "32x32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Save((Join-Path $iconDir "128x128.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Save((Join-Path $iconDir "128x128@2x.png"), [System.Drawing.Imaging.ImageFormat]::Png)

# Resize for different sizes
$bitmap32 = New-Object System.Drawing.Bitmap($bitmap, 32, 32)
$bitmap32.Save((Join-Path $iconDir "32x32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap32.Dispose()

$bitmap128 = New-Object System.Drawing.Bitmap($bitmap, 128, 128)
$bitmap128.Save((Join-Path $iconDir "128x128.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap128.Dispose()

$bitmap256 = New-Object System.Drawing.Bitmap($bitmap, 256, 256)
$bitmap256.Save((Join-Path $iconDir "128x128@2x.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap256.Dispose()

$bitmap.Dispose()

Write-Host "Created placeholder icons in $iconDir"
Write-Host "Note: You still need to create icon.ico and icon.icns files"
Write-Host "Run: pnpm tauri icon $iconDir\128x128@2x.png"

