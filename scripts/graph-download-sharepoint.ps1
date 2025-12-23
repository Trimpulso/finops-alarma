param(
    [string]$TenantId = $env:GRAPH_TENANT_ID,
    [string]$ClientId = $env:GRAPH_CLIENT_ID,
    [string]$ClientSecret = $env:GRAPH_CLIENT_SECRET,
    [string]$SiteHostname = $env:SHAREPOINT_HOSTNAME,
    [string]$SitePath = $env:SHAREPOINT_SITE_PATH,
    [string]$DriveName = $env:SHAREPOINT_DRIVE_NAME,
    [string]$ItemPath = $env:SHAREPOINT_ITEM_PATH,
    [string]$OutputPath = "data/FinOps-Azure-Alertado.xlsx",
    [string]$StatusPath = "data/status.json"
)

Function Get-GraphToken {
  param($TenantId,$ClientId,$ClientSecret)
  $body = @{
    client_id = $ClientId
    client_secret = $ClientSecret
    scope = "https://graph.microsoft.com/.default"
    grant_type = "client_credentials"
  }
  $resp = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Body $body -ContentType "application/x-www-form-urlencoded"
  return $resp.access_token
}

Function Invoke-Graph {
  param($Token,$Method,$Uri)
  Invoke-RestMethod -Headers @{ Authorization = "Bearer $Token" } -Method $Method -Uri $Uri
}

$repoRoot = (Get-Location).Path
$dataDir = Join-Path $repoRoot 'data'
if (!(Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }

$status = @{
  exists = $false
  checked = [DateTime]::UtcNow.ToString("o")
  source = "SharePoint"
  message = "Inicio de sincronización"
}

function Save-Status($ok,$msg) {
  $status.exists = $ok
  $status.checked = [DateTime]::UtcNow.ToString("o")
  $status.message = $msg
  $status | ConvertTo-Json -Depth 5 | Set-Content -Path $StatusPath -Encoding UTF8
}

try {
  if (-not ($TenantId -and $ClientId -and $ClientSecret -and $SiteHostname -and $SitePath -and $ItemPath)) {
    Save-Status $false "Faltan variables: GRAPH_* y/o SHAREPOINT_*"
    exit 2
  }
  if (-not $DriveName) { $DriveName = "Documents" }

  $token = Get-GraphToken -TenantId $TenantId -ClientId $ClientId -ClientSecret $ClientSecret

  $siteUri = "https://graph.microsoft.com/v1.0/sites/$SiteHostname`:/sites/$SitePath`?`$select=id,name"
  $site = Invoke-Graph -Token $token -Method Get -Uri $siteUri

  if (-not $site.id) { Save-Status $false "No se encontró el sitio"; exit 3 }

  $drives = Invoke-Graph -Token $token -Method Get -Uri "https://graph.microsoft.com/v1.0/sites/$($site.id)/drives"
  $drive = $drives.value | Where-Object { $_.name -eq $DriveName } | Select-Object -First 1
  if (-not $drive.id) { Save-Status $false "No se encontró la biblioteca '$DriveName'"; exit 4 }

  $downloadUri = "https://graph.microsoft.com/v1.0/drives/$($drive.id)/root:/$ItemPath`:/content"
  $outFile = Join-Path $repoRoot $OutputPath

  Invoke-WebRequest -Headers @{ Authorization = "Bearer $token" } -Uri $downloadUri -Method Get -OutFile $outFile

  $fs = [System.IO.File]::OpenRead($outFile)
  try {
    $b1 = $fs.ReadByte()
    $b2 = $fs.ReadByte()
  } finally { $fs.Close() }
  if ($b1 -ne 80 -or $b2 -ne 75) {
    Save-Status $false "Descarga inválida (no XLSX)."
    exit 5
  }
  Save-Status $true "Sincronizado correctamente."
  exit 0
}
catch {
  Save-Status $false ("Error: " + $_.Exception.Message)
  exit 1
}
