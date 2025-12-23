param(
    [Parameter(Mandatory=$true)] [string]$Url,
    [Parameter(Mandatory=$true)] [string]$User,
    [Parameter(Mandatory=$true)] [string]$Password,
    [string]$OutFile = "../data/FinOps-Azure-Alertado.xlsx",
    [string]$StatusFile = "../data/status.json"
)

# Descarga el archivo desde SharePoint y actualiza status.json
# Uso: pwsh tools/sync-sharepoint.ps1 -Url "<link>" -User "user" -Password "pass"

$ErrorActionPreference = "Stop"

$secPass = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($User, $secPass)

$status = @{ exists = $false; checked = (Get-Date -Format "yyyy-MM-dd HH:mm:ss"); source = $Url; message = "" }

try {
    Invoke-WebRequest -Uri $Url -OutFile $OutFile -Credential $cred -UseBasicParsing

    # Verificar si el archivo parece ZIP (XLSX) por cabecera
    $bytes = Get-Content -Path $OutFile -Encoding Byte -TotalCount 4
    if ($bytes[0] -eq 80 -and $bytes[1] -eq 75) {
        $status.exists = $true
        $status.message = "Sincronizado correctamente"
    } else {
        $status.exists = $false
        $status.message = "Descargado pero no es XLSX (cabecera no PK)"
    }
}
catch {
    $status.exists = $false
    $status.message = "Error: $($_.Exception.Message)"
}

$status | ConvertTo-Json | Set-Content -Path $StatusFile -Encoding UTF8
