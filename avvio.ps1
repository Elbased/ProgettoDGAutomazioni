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
    (Get-PortableNodeDir),
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

function Get-PortableNodeBase {
  return Join-Path $env:LOCALAPPDATA "ZephyrusTech\node"
}

function Get-PortableNodeDir {
  $currentFile = Join-Path (Get-PortableNodeBase) "current.txt"
  if (-not (Test-Path $currentFile)) { return $null }

  $portableDir = (Get-Content -LiteralPath $currentFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if (-not $portableDir) { return $null }
  if (-not (Test-Path $portableDir)) { return $null }

  return $portableDir
}

function Install-NodeViaWinget {
  if (-not $isWindows) { return }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { return }

  Write-Host "Installing Node.js LTS with winget..."
  winget install -e --id OpenJS.NodeJS.LTS --source winget --accept-source-agreements --accept-package-agreements --silent --disable-interactivity | Out-Null
}

function Install-NodePortable {
  if (-not $isWindows) { return }

  Write-Host "Installing Node.js LTS via direct download..."
  $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
  $index = Invoke-RestMethod "https://nodejs.org/dist/index.json"
  $lts = $index | Where-Object { $_.lts } | Select-Object -First 1
  if (-not $lts) {
    throw "Unable to resolve latest Node.js LTS version."
  }

  $zipName = "node-$($lts.version)-win-$arch.zip"
  if ($lts.files -notcontains "win-$arch-zip") {
    throw "Portable Node.js package not available for architecture $arch."
  }

  $url = "https://nodejs.org/dist/$($lts.version)/$zipName"
  $dest = Join-Path $env:TEMP $zipName
  $baseDir = Get-PortableNodeBase
  $portableDir = Join-Path $baseDir ("node-$($lts.version)-win-$arch")

  Invoke-WebRequest $url -OutFile $dest
  New-Item -ItemType Directory -Force -Path $baseDir | Out-Null

  if (Test-Path $portableDir) {
    Remove-Item -LiteralPath $portableDir -Recurse -Force
  }

  Expand-Archive -LiteralPath $dest -DestinationPath $baseDir -Force
  Set-Content -LiteralPath (Join-Path $baseDir "current.txt") -Value $portableDir
}

function Ensure-Node {
  Add-KnownNodePaths
  if (Get-Command node -ErrorAction SilentlyContinue) {
    return
  }

  if ($isWindows) {
    Install-NodeViaWinget
    Add-KnownNodePaths
    if (Get-Command node -ErrorAction SilentlyContinue) { return }

    Install-NodePortable
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
  if ($_.Exception.Message) {
    Write-Host $_.Exception.Message
  }
  Write-Host ""
  exit 1
}

