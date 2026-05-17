# Quick admin API smoke test (requires API on :4000)
$ErrorActionPreference = "Stop"
$Base = $env:NEXT_PUBLIC_API_URL
if (-not $Base) { $Base = "http://127.0.0.1:4000" }

Write-Host "Health..."
$h = Invoke-RestMethod "$Base/health" -TimeoutSec 5
Write-Host "  OK: $($h.status)"

$email = $env:ADMIN_SEED_EMAIL
if (-not $email) { $email = "admin@kangba.local" }
$pass = $env:ADMIN_SEED_PASSWORD
if (-not $pass) { $pass = "kangba-admin-change-me" }

Write-Host "Login..."
$login = Invoke-RestMethod -Method POST -Uri "$Base/api/admin/auth/login" `
  -ContentType "application/json" `
  -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
$token = $login.data.token
Write-Host "  OK: $($login.data.user.email)"

$headers = @{ Authorization = "Bearer $token" }

Write-Host "Me..."
$me = Invoke-RestMethod -Uri "$Base/api/admin/auth/me" -Headers $headers
Write-Host "  OK: $($me.data.role)"

Write-Host "CMS overview..."
$o = Invoke-RestMethod -Uri "$Base/api/admin/content/overview" -Headers $headers
Write-Host "  pages=$($o.data.pages) faqs=$($o.data.faqs)"

Write-Host "Shop list..."
$s = Invoke-RestMethod -Uri "$Base/api/admin/shop" -Headers $headers
Write-Host "  items=$($s.data.Count)"

Write-Host "Admin smoke passed."
