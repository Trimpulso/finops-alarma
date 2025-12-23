# Script local para sincronizar Excel desde SharePoint a C:\github\alerta
# Uso: .\sync-local.ps1

param(
    [string]$Username = $env:SHAREPOINT_USER,
    [string]$Password = $env:SHAREPOINT_PASS,
    [string]$SharePointUrl = $env:SHAREPOINT_EXCEL_URL
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataDir = Join-Path $repoRoot "data"

# Crear carpeta data si no existe
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    Write-Host "📁 Carpeta 'data' creada"
}

# Validar credenciales
if (-not $Username -or -not $Password) {
    Write-Host "❌ Error: Variables de entorno no configuradas"
    Write-Host "Configura:"
    Write-Host "  `$env:SHAREPOINT_USER = 'tu_usuario'"
    Write-Host "  `$env:SHAREPOINT_PASS = 'tu_contraseña'"
    Write-Host "  `$env:SHAREPOINT_EXCEL_URL = 'URL_DEL_ARCHIVO'"
    exit 1
}

# Convertir password a SecureString
$secPassword = ConvertTo-SecureString $Password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($Username, $secPassword)

$outputFile = Join-Path $dataDir "FinOps-Azure-Alertado.xlsx"
$statusFile = Join-Path $dataDir "status.json"

try {
    Write-Host "🔄 Descargando archivo desde SharePoint..."
    Write-Host "   URL: $SharePointUrl"
    
    Invoke-WebRequest -Uri $SharePointUrl `
                      -OutFile $outputFile `
                      -Credential $credential `
                      -UseBasicParsing
    
    Write-Host "✅ Archivo descargado"
    
    # Verificar que es un XLSX válido (cabecera ZIP: PK)
    $bytes = [System.IO.File]::ReadAllBytes($outputFile)
    if ($bytes[0] -eq 0x50 -and $bytes[1] -eq 0x4b) {
        Write-Host "✅ Validación OK: Es un archivo XLSX válido"
        
        # Crear archivo de estado
        $status = @{
            exists = $true
            checked = [DateTime]::UtcNow.ToString("o")
            source = "SharePoint (Sincronización local)"
            message = "Sincronizado correctamente"
        }
        
        $status | ConvertTo-Json | Set-Content -Path $statusFile -Encoding UTF8
        Write-Host "✅ Archivo de estado creado: $statusFile"
        Write-Host "📊 Ruta final: $outputFile"
        Write-Host ""
        Write-Host "✨ ¡Sincronización completada exitosamente!"
        
    } else {
        Write-Host "❌ Error: El archivo descargado no es un XLSX válido"
        Write-Host "   Posible causa: Página de login HTML en lugar del Excel"
        exit 1
    }
    
} catch {
    Write-Host "❌ Error durante la descarga: $($_.Exception.Message)"
    
    # Crear archivo de estado con error
    $status = @{
        exists = $false
        checked = [DateTime]::UtcNow.ToString("o")
        source = "SharePoint (Sincronización local)"
        message = "Error: $($_.Exception.Message)"
    }
    
    $status | ConvertTo-Json | Set-Content -Path $statusFile -Encoding UTF8
    exit 1
}
