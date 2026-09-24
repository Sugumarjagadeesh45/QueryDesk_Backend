$ErrorActionPreference = 'Stop'

$base = "http://localhost:5000/api"
$pass = @{}  # track test results

function Test-API {
    param($name, $method, $url, $body, $headers)
    try {
        $params = @{ Uri = $url; Method = $method; ContentType = "application/json" }
        if ($body) { $params.Body = ($body | ConvertTo-Json) }
        if ($headers) { $params.Headers = $headers }
        $resp = Invoke-RestMethod @params
        Write-Host "  ✅ $name"
        return $resp
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ $name → HTTP $code : $($_.ErrorDetails.Message)"
        return $null
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  QUERYDESK BACKEND — COMPLETE TEST SUITE"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n"

# ── TEST 1: Health Check ──────────────────────────────────────────
$h = Test-API "GET /api/health" GET "$base/health" $null $null
Write-Host "   Response: success=$($h.success) message='$($h.message)'"

# ── TEST 2: Register New User ─────────────────────────────────────
$newUser = Test-API "POST /api/auth/register" POST "$base/auth/register" @{name="Test User";email="testuser@test.com";password="Test@123"} $null
Write-Host "   Created: $($newUser.user.name) | role=$($newUser.user.role) | success=$($newUser.success)"

# ── TEST 3: Login as USER ─────────────────────────────────────────
$userLogin = Test-API "POST /api/auth/login (user)" POST "$base/auth/login" @{email="user@example.com";password="User@123"} $null
$userToken = $userLogin.token
$uH = @{ Authorization = "Bearer $userToken"; "Content-Type" = "application/json" }
Write-Host "   Logged in: $($userLogin.user.name) | role=$($userLogin.user.role)"

# ── TEST 4: GET /me ───────────────────────────────────────────────
$me = Test-API "GET /api/auth/me" GET "$base/auth/me" $null $uH
Write-Host "   Me: $($me.user.name) | success=$($me.success)"

# ── TEST 5: Create Query ──────────────────────────────────────────
$q = Test-API "POST /api/queries" POST "$base/queries" @{subject="Test API Query";description="Automated test suite query."} $uH
$qId = $q.query._id
Write-Host "   Created: $($q.query.queryId) | status=$($q.query.status)"

# ── TEST 6: Get My Queries ────────────────────────────────────────
$myQ = Test-API "GET /api/queries/my" GET "$base/queries/my" $null $uH
Write-Host "   Count: $($myQ.count)"

# ── TEST 7: Login ADMIN ──────────────────────────────────────────
$adminLogin = Test-API "POST /api/auth/login (admin)" POST "$base/auth/login" @{email="admin@example.com";password="Admin@123"} $null
$adminToken = $adminLogin.token
$aH = @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" }
Write-Host "   Logged in: $($adminLogin.user.name) | role=$($adminLogin.user.role)"

# ── TEST 8: Admin gets all queries ───────────────────────────────
$all = Test-API "GET /api/admin/queries" GET "$base/admin/queries" $null $aH
Write-Host "   Total queries: $($all.count)"

# ── TEST 9: Admin update → IN_PROGRESS ──────────────────────────
$upd1 = Test-API "PATCH /api/admin/queries/:id (IN_PROGRESS)" PATCH "$base/admin/queries/$qId" @{status="IN_PROGRESS";adminResponse="Checked."} $aH
Write-Host "   New status: $($upd1.query.status)"

# ── TEST 10: User sees IN_PROGRESS ───────────────────────────────
$uq1 = Test-API "GET /api/queries/:id (user check)" GET "$base/queries/$qId" $null $uH
Write-Host "   Status: $($uq1.query.status)"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  QUICK TESTS PASSED"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n"
