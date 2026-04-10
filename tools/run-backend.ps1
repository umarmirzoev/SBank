param(
    [switch]$NoRun
)

$ErrorActionPreference = "Stop"

$sourceRoot = "C:\Users\HP\Desktop\]\SBank"
$safeRoot = "C:\Users\HP\Desktop\SBankSafeCopy"
$apiProject = Join-Path $safeRoot "Backend\API\API.csproj"
$apiWorkDir = Join-Path $safeRoot "Backend\API"

if (-not (Test-Path -LiteralPath $sourceRoot)) {
    throw "Source repo not found: $sourceRoot"
}

if (-not (Test-Path -LiteralPath $safeRoot)) {
    New-Item -ItemType Directory -Path $safeRoot | Out-Null
}

$runningApi = Get-Process -Name "API" -ErrorAction SilentlyContinue
if ($runningApi) {
    $runningApi | Stop-Process -Force
}

$robocopyArgs = @(
    $sourceRoot,
    $safeRoot,
    "/MIR",
    "/XD", ".git", "node_modules", "dist"
)

$null = & robocopy @robocopyArgs
$robocopyExitCode = $LASTEXITCODE
if ($robocopyExitCode -ge 8) {
    throw "robocopy failed with exit code $robocopyExitCode"
}

Push-Location $apiWorkDir
try {
    dotnet build $apiProject -v minimal
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet build failed with exit code $LASTEXITCODE"
    }

    if (-not $NoRun) {
        dotnet run --project $apiProject
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet run failed with exit code $LASTEXITCODE"
        }
    }
}
finally {
    Pop-Location
}
