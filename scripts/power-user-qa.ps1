# KENBA Power User QA — Windows / PowerShell
# Usage: .\scripts\power-user-qa.ps1 [-SkipDeploy] [-Prod]
param(
  [switch]$SkipDeploy = $true,
  [switch]$Prod,
  [switch]$ApiOnly
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $val = $matches[2].Trim().Trim('"')
      Set-Item -Path "env:$name" -Value $val -ErrorAction SilentlyContinue
    }
  }
}

if ($Prod) {
  $WebBase = if ($env:SMOKE_BASE_URL) { $env:SMOKE_BASE_URL } else { "http://localhost" }
  $ApiBase = "$WebBase"
  $AdminBase = "$WebBase/admin"
} else {
  $WebBase = if ($env:WEB_BASE) { $env:WEB_BASE } else { "http://127.0.0.1:3000" }
  $ApiBase = if ($env:API_BASE) { $env:API_BASE } else { "http://127.0.0.1:4000" }
  $AdminBase = if ($env:ADMIN_BASE) { $env:ADMIN_BASE } else { "http://127.0.0.1:3001" }
}

$AdminKey = $env:ADMIN_API_KEY
$PowerEmail = if ($env:QA_POWER_EMAIL) { $env:QA_POWER_EMAIL } else { "poweruser@KENBA.local" }
$Locale = if ($env:QA_LOCALE) { $env:QA_LOCALE } else { "en" }

$failures = 0
function Test-Url {
  param([string]$Label, [string]$Url, [int[]]$Ok = @(200, 301, 302, 307))
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
    $code = [int]$r.StatusCode
    if ($Ok -contains $code) {
      Write-Host "  OK $code $Label"
      return $true
    }
    Write-Host "  FAIL $code $Label ($Url)"
    $script:failures++
    return $false
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    Write-Host "  FAIL $code $Label ($Url) — $($_.Exception.Message)"
    $script:failures++
    return $false
  }
}

function Invoke-Api {
  param(
    [string]$Method = "GET",
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = $null,
    [hashtable]$ExtraHeaders = @{}
  )
  $uri = if ($Path.StartsWith("http")) { $Path } else { "$ApiBase$Path" }
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  foreach ($k in $ExtraHeaders.Keys) { $headers[$k] = $ExtraHeaders[$k] }
  $params = @{ Uri = $uri; Method = $Method; Headers = $headers; TimeoutSec = 60 }
  if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
  $raw = Invoke-RestMethod @params
  return $raw
}

Write-Host "==> KENBA Power User QA"
Write-Host "    Web: $WebBase | API: $ApiBase | Admin: $AdminBase"

if (-not $SkipDeploy -and $Prod) {
  Write-Host "==> Deploy (production)"
  bash ./scripts/deploy.sh
  if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed"; $failures++ }
}

Write-Host "==> Health"
Test-Url "API /health" "$ApiBase/health"
if (-not $ApiOnly) { Test-Url "Web /en" "$WebBase/en" }
if ($Prod) {
  Test-Url "API via nginx" "$WebBase/api/events?locale=en"
} else {
  Write-Host "  (dev: API direct at $ApiBase — web has no /api proxy)"
}

if ($ApiOnly) {
  Write-Host "==> Skipping web page checks (-ApiOnly)"
} else {
Write-Host "==> Locale page smoke"
$locales = @("en", "zh", "ko", "ja", "ar")
$paths = @(
  "/lore",
  "/lore/factions/necropolis-dominion",
  "/events",
  "/events/hollow-king-awakening",
  "/campaigns/hollow-king-awakening"
)
foreach ($loc in $locales) {
  foreach ($p in $paths) {
    Test-Url "${loc}${p}" "$WebBase/${loc}${p}" | Out-Null
  }
}
}

Write-Host "==> Admin logins"
$adminAccounts = @(
  @{ email = "admin@kangba.local"; password = "kangba-admin-change-me" },
  @{ email = "editor@kangba.local"; password = "kangba-editor-change-me" },
  @{ email = "viewer@kangba.local"; password = "kangba-viewer-change-me" }
)
$adminToken = $null
foreach ($acc in $adminAccounts) {
  try {
    $res = Invoke-Api -Method POST -Path "/api/admin/auth/login" -Body @{
      email = $acc.email
      password = $acc.password
    }
    if ($res.success -and $res.data.token) {
      Write-Host "  OK admin login $($acc.email) ($($res.data.user.role))"
      if (-not $adminToken) { $adminToken = $res.data.token }
    } else {
      Write-Host "  FAIL admin login $($acc.email)"
      $failures++
    }
  } catch {
    Write-Host "  FAIL admin login $($acc.email) — $($_.Exception.Message)"
    $failures++
  }
}

Write-Host "==> Power user auth (email OTP)"
$accessToken = $null
$userId = $null
try {
  Invoke-Api -Method POST -Path "/api/login/email/request" -Body @{ email = $PowerEmail } | Out-Null
  Start-Sleep -Seconds 1
  Push-Location "$Root\server"
  $codeRaw = pnpm exec dotenv -e ../.env -- tsx ../scripts/qa-get-email-code.ts $PowerEmail 2>&1
  Pop-Location
  $code = ""
  if ($codeRaw) {
    $code = ($codeRaw | Out-String) -replace "`r", "" -split "`n" |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -match '^\d{6}$' } |
      Select-Object -First 1
  }
  if (-not $code) {
    Write-Host "  FAIL could not read verification code from DB (run seed / MOCK_SMTP)"
    $failures++
  } else {
    $session = Invoke-Api -Method POST -Path "/api/login/email/verify" -Body @{
      email = $PowerEmail
      code = $code
    }
    if ($session.success -and $session.data.accessToken) {
      $accessToken = $session.data.accessToken
      $userId = $session.data.user.id
      Write-Host "  OK JWT for $PowerEmail (user $userId)"
    } else {
      Write-Host "  FAIL email verify"
      $failures++
    }
  }
} catch {
  Write-Host "  FAIL power user auth — $($_.Exception.Message)"
  $failures++
}

if ($accessToken) {
  Write-Host "==> Engagement simulation"
  try {
    $claim = Invoke-Api -Method POST -Path "/api/signin/claim" -Token $accessToken -Body @{}
    Write-Host "  signin claim: +$($claim.data.rewardPoints) pts (balance $($claim.data.pointsBalance))"
  } catch {
    Write-Host "  WARN signin claim — $($_.Exception.Message)"
  }

  try {
    $tasks = Invoke-Api -Path "/api/tasks" -Token $accessToken
    foreach ($t in $tasks.data) {
      if ($t.completed) { continue }
      try {
        Invoke-Api -Method POST -Path "/api/tasks/complete" -Token $accessToken -Body @{ taskId = $t.id } | Out-Null
        Write-Host "  completed task: $($t.name)"
      } catch {
        Write-Host "  skip task $($t.id): $($_.Exception.Message)"
      }
    }
  } catch {
    Write-Host "  WARN tasks — $($_.Exception.Message)"
  }

  $eventSlug = "hollow-king-awakening"
  try {
    $ev = Invoke-Api -Path "/api/events/${eventSlug}?locale=$Locale" -Token $accessToken
    foreach ($t in $ev.data.event.tasks) {
      try {
        Invoke-Api -Method POST -Path "/api/events/${eventSlug}/advance?locale=$Locale" -Token $accessToken -Body @{ taskId = $t.id } | Out-Null
        Write-Host "  advanced event task: $($t.title)"
      } catch {
        Write-Host "  skip event task $($t.id)"
      }
    }
  } catch {
    Write-Host "  WARN events — $($_.Exception.Message)"
  }

  $campSlug = "hollow-king-awakening"
  try {
    $camp = Invoke-Api -Path "/api/campaigns/${campSlug}?locale=$Locale" -Token $accessToken
    foreach ($q in $camp.data.campaign.quests) {
      try {
        Invoke-Api -Method POST -Path "/api/campaigns/${campSlug}/advance?locale=$Locale" -Token $accessToken -Body @{ questId = $q.id } | Out-Null
        Write-Host "  advanced campaign quest: $($q.title)"
      } catch {
        Write-Host "  skip quest $($q.id)"
      }
    }
  } catch {
    Write-Host "  WARN campaigns — $($_.Exception.Message)"
  }

  try {
    $me = Invoke-Api -Path "/api/auth/me" -Token $accessToken
    $comm = Invoke-Api -Path "/api/community/me" -Token $accessToken
    Write-Host "  auth/me points: $($me.data.user.points)"
    Write-Host "  community badges: $($comm.data.badges.Count) tier: $($comm.data.profile.inviteTierKey)"
    if ($userId) {
      $profile = Invoke-Api -Path "/api/profile/$userId"
      Write-Host "  profile NFTs: $($profile.data.nfts.Count)"
    }
  } catch {
    Write-Host "  WARN profile/community — $($_.Exception.Message)"
  }
}

Write-Host "==> Admin API checks"
$adminHeaders = @{}
if ($AdminKey) { $adminHeaders["X-Admin-Key"] = $AdminKey }
elseif ($adminToken) { $adminHeaders["Authorization"] = "Bearer $adminToken" }
if ($adminHeaders.Count -gt 0) {
  try {
    $exp = Invoke-Api -Path "/api/admin/events/export" -ExtraHeaders $adminHeaders
    Write-Host "  OK events export ($($exp.data.Count) events)"
  } catch {
    Write-Host "  WARN events export — $($_.Exception.Message)"
  }
  try {
    $comm = Invoke-Api -Path "/api/admin/community" -ExtraHeaders $adminHeaders
    Write-Host "  OK community admin ($($comm.data.badges.Count) badges)"
  } catch {
    Write-Host "  WARN community admin — $($_.Exception.Message)"
  }
  try {
    $mon = Invoke-Api -Path "/api/admin/monitoring" -ExtraHeaders $adminHeaders
    Write-Host "  OK monitoring status: $($mon.data.status)"
  } catch {
    Write-Host "  WARN monitoring — $($_.Exception.Message)"
  }
} else {
  Write-Host "  SKIP admin API (set ADMIN_API_KEY or fix admin login)"
}

Write-Host ""
if ($failures -eq 0) {
  Write-Host "Power User QA completed — all critical checks passed."
  exit 0
} else {
  Write-Host "Power User QA completed with $failures critical failure(s)."
  exit 1
}
