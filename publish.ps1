# 一键把个人网站推到 GitHub（仓库名必须是 gyx-yuyu.github.io）
$ErrorActionPreference = "Stop"
$site = $PSScriptRoot
$repo = "https://github.com/gyx-yuyu/gyx-yuyu.github.io.git"

Write-Host ""
Write-Host "=== 发布个人网站到 GitHub ===" -ForegroundColor Cyan
Set-Location -LiteralPath $site

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "没有找到 git，请先安装 Git for Windows。" -ForegroundColor Red
    exit 1
}

function Test-RepoExists {
    try {
        $r = Invoke-WebRequest -Uri "https://github.com/gyx-yuyu/gyx-yuyu.github.io" -Method Head -UseBasicParsing -TimeoutSec 15
        return ($r.StatusCode -eq 200)
    } catch {
        return $false
    }
}

if (-not (Test-RepoExists)) {
    Write-Host "GitHub 上还没有 gyx-yuyu.github.io 这个仓库。" -ForegroundColor Yellow
    Write-Host "现在帮你打开新建页面，按下面三步做：" -ForegroundColor Yellow
    Write-Host "  1) 仓库名保持 gyx-yuyu.github.io（不要改）"
    Write-Host "  2) 可见性选 Public"
    Write-Host "  3) 点最下面的 Create repository（什么都不要勾）"
    Start-Process "https://github.com/new?name=gyx-yuyu.github.io&visibility=public"
    Read-Host "建好以后回到这个窗口，按回车继续"
    if (-not (Test-RepoExists)) {
        Write-Host "还是没检测到仓库。建好后再双击一次这个脚本就行。" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $site ".git"))) {
    Write-Host "初始化本地仓库…"
    git init | Out-Null
    git branch -M main
}

# 第一次在这台电脑提交时，git 可能没有身份信息，先补一个本仓库专用的
$gitName = git config user.name
if ([string]::IsNullOrWhiteSpace($gitName)) {
    git config user.name "gyx-yuyu"
}
$gitEmail = git config user.email
if ([string]::IsNullOrWhiteSpace($gitEmail)) {
    git config user.email "gyx-yuyu@users.noreply.github.com"
}

git add -A
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "更新个人作品网站 $stamp" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "没有新改动需要提交，继续推送已有版本。" -ForegroundColor Yellow
}

$hasRemote = (git remote) -contains "origin"
if (-not $hasRemote) {
    git remote add origin $repo
} else {
    git remote set-url origin $repo
}

Write-Host ""
Write-Host "正在推送…第一次会弹出浏览器让你登录 GitHub，登录后会自动继续。" -ForegroundColor Yellow
Write-Host "如果提示仓库不存在，请先去 https://github.com/new?name=gyx-yuyu.github.io 建一个 Public 仓库。" -ForegroundColor Yellow
Write-Host ""

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "推送失败：多半是 GitHub 登录的不是 gyx-yuyu，或本地还缓存着旧账号的凭据。" -ForegroundColor Red
    Write-Host "处理：打开「凭据管理器 → Windows 凭据」，删掉 git:https://github.com，再双击本脚本重新登录。" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "推送完成！" -ForegroundColor Green
Write-Host "接下来检查两件事：" -ForegroundColor Green
Write-Host "  1) 仓库 Settings → Pages：Source 选 Deploy from a branch，Branch 选 main + / (root)，Save"
Write-Host "  2) 等 1–2 分钟后打开 https://gyx-yuyu.github.io/"
