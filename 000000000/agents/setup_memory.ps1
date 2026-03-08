# Agent记忆系统设置

# 创建记忆目录结构
$memoryRoot = "C:\Users\lenovo\.openclaw\agents\memory"
if (-not (Test-Path $memoryRoot)) {
    New-Item -Path $memoryRoot -ItemType Directory -Force | Out-Null
}

# 创建每日和每周目录
$dailyDir = "$memoryRoot\daily"
$weeklyDir = "$memoryRoot\weekly"
if (-not (Test-Path $dailyDir)) { New-Item -Path $dailyDir -ItemType Directory -Force | Out-Null }
if (-not (Test-Path $weeklyDir)) { New-Item -Path $weeklyDir -ItemType Directory -Force | Out-Null }

# 为每个Agent创建记忆目录
$agents = @("data-analyst", "product-researcher", "promotion-specialist", "supplier-analyst", "hanai-daily-report", "main")

foreach ($agent in $agents) {
    $agentMemoryDir = "C:\Users\lenovo\.openclaw\agents\$agent\memory"
    if (-not (Test-Path $agentMemoryDir)) {
        New-Item -Path $agentMemoryDir -ItemType Directory -Force | Out-Null
        Write-Host "创建 $agent 记忆目录"
    }
}

# 创建系统记忆文件
$systemMemoryFile = "$memoryRoot\system_memory.md"
if (-not (Test-Path $systemMemoryFile)) {
    $content = "# 多Agent系统记忆管理`n`n## 系统配置记忆`n- Agent配置版本记录`n- 工具权限调整历史`n- 协作协议演进记录`n`n## 性能数据记忆`n- 各Agent任务处理统计`n- 系统资源使用趋势`n- 并发性能记录`n`n**更新时间: $(Get-Date -Format 'yyyy-MM-dd')"
    Set-Content -Path $systemMemoryFile -Value $content -Encoding UTF8
    Write-Host "创建系统记忆文件"
}

Write-Host "`n记忆系统设置完成!"
Write-Host "================"
Write-Host "✅ 6个Agent记忆目录"
Write-Host "✅ 系统记忆管理文件"
Write-Host "✅ 每日/每周归档结构"
Write-Host "`n每个Agent现在都有独立的记忆存储!" -ForegroundColor Green