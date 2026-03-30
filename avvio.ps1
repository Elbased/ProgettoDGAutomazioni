$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir

if (-not $env:ZEPHYRUS_BANNER_SHOWN) {
  Write-Host "=========================================="
  Write-Host " ZephyrusTech - Avvio Progetto"
  Write-Host "=========================================="
}

$env:ZEPHYRUS_BANNER_SHOWN = "1"

$isWindows = $env:OS -eq "Windows_NT"

function Add-KnownNodePaths {
  $paths = @(
    "$env:ProgramFiles\nodejs",
    "$env:ProgramFiles(x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs"
  )

  foreach ($path in $paths) {
    if ($path -and (Test-Path $path) -and ($env:Path -notlike "*$path*")) {
      $env:Path = "$path;$env:Path"
    }
  }
}

function Resolve-NpmCommand {
  $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
  if ($npmCmd) { return $npmCmd.Path }

  $paths = @(
    "$env:ProgramFiles\nodejs\npm.cmd",
    "$env:ProgramFiles(x86)\nodejs\npm.cmd",
    "$env:LOCALAPPDATA\Programs\nodejs\npm.cmd"
  )

  foreach ($path in $paths) {
    if (Test-Path $path) { return $path }
  }

  return $null
}

function Install-NodeViaWinget {
  if (-not $isWindows) { return }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { return }

  Write-Host "Installing Node.js LTS with winget..."
  winget install -e --id OpenJS.NodeJS.LTS --source winget | Out-Null
}

function Install-NodeViaMsi {
  if (-not $isWindows) { return }

  Write-Host "Installing Node.js LTS via direct download..."
  $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
  $base = "https://nodejs.org/dist/latest-v20.x/"
  $html = Invoke-WebRequest -UseBasicParsing $base
  $msi = ($html.Links | Where-Object { $_.href -match "node-v\\d+\\.\\d+\\.\\d+-$arch\\.msi" } | Select-Object -First 1).href

  if (-not $msi) {
    throw "MSI not found"
  }

  $url = $base + $msi
  $dest = Join-Path $env:TEMP $msi
  Invoke-WebRequest $url -OutFile $dest
  Start-Process msiexec.exe -Wait -ArgumentList "/i `"$dest`" /qn /norestart ALLUSERS=0"
}

function Ensure-Node {
  if (Get-Command node -ErrorAction SilentlyContinue) {
    return
  }

  if ($isWindows) {
    Install-NodeViaWinget
    Add-KnownNodePaths
    if (Get-Command node -ErrorAction SilentlyContinue) { return }

    Install-NodeViaMsi
    Add-KnownNodePaths
    if (Get-Command node -ErrorAction SilentlyContinue) { return }
  }

  Write-Host "Node.js not found. Please install the LTS version and re-run this script."
  throw "Node.js missing"
}

try {
  Ensure-Node
  Add-KnownNodePaths

  $npmPath = Resolve-NpmCommand
  if (-not $npmPath) {
    Write-Host "npm not found after Node.js check."
    throw "npm missing"
  }

  if (-not (Test-Path -Path (Join-Path $scriptDir "node_modules"))) {
    Write-Host "Installing npm dependencies..."
    & $npmPath install
  }

  Write-Host "Starting ZephyrusTech Dev Server..."

  Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    try {
      Start-Process "http://localhost:3002/#presentation" | Out-Null
    } catch {
      Write-Host "Open http://localhost:3002/#presentation in your browser."
    }
  } | Out-Null

  & $npmPath run dev -- --host --port 3002
} catch {
  Write-Host ""
  Write-Host "Avvio interrotto."
  Write-Host ""
  exit 1
}

