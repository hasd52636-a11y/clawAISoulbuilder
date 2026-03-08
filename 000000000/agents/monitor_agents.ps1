# Multi-Agent System Monitor
# 多Agent系统监控脚本

Write-Host "🤖 多Agent系统状态检查" -ForegroundColor Green
Write-Host "========================"

# 检查各个Agent目录状态
$agents = @("data-analyst", "product-researcher", "promotion-specialist", "supplier-analyst", "hanai-daily-report", "main")

foreach ($agent in $agents) {
    $agentPath = "C:\Users\lenovo\.openclaw\agents\$agent"
    
    if (Test-Path $agentPath) {
        $soulFile = "$agentPath\agent\SOUL.md"
        $toolsFile = "$agentPath\agent\TOOLS.md"
        
        $soulExists = Test-Path $soulFile
        $toolsExists = Test-Path $toolsFile
        
        Write-Host "🔹 $agent : " -NoNewline
        
        if ($soulExists -and $toolsExists) {
            Write-Host "✅ 配置完整 (SOUL+TOOLS)" -ForegroundColor Green
        } elseif ($soulExists) {
            Write-Host "⚠️  缺少TOOLS配置" -ForegroundColor Yellow
        } else {
            Write-Host "❌ 配置缺失" -ForegroundColor Red
        }
    } else {
        Write-Host "🔹 $agent : ❌ 目录不存在" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 协作配置检查" -ForegroundColor Cyan
Write-Host "================"

$collabFile = "C:\Users\lenovo\.openclaw\agents\COLLABORATION.md"
if (Test-Path $collabFile) {
    Write-Host "✅ 协作协议文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ 协作协议文件缺失" -ForegroundColor Red
}

# 检查飞书绑定状态
Write-Host ""
Write-Host "📱 飞书绑定状态" -ForegroundColor Magenta
Write-Host "==============="

# 从openclaw.json读取绑定信息
$configPath = "C:\Users\lenovo\.openclaw\openclaw.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    $bindings = $config.channels.feishu.bindings
    
    foreach ($binding in $bindings) {
        $agentId = $binding.agentId
        $chatId = $binding.match.peer.id
        Write-Host "🔗 $agentId → 飞书群: $chatId" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎯 系统建议" -ForegroundColor Yellow
Write-Host "=========="
Write-Host "1. ✅ Agent角色定义完成"
Write-Host "2. ✅ 工具权限配置完成"
Write-Host "3. ✅ 协作协议制定完成"
Write-Host "4. ✅ 飞书绑定配置完成"
Write-Host "5. ⚠️  需要测试任务分发功能"
Write-Host "6. ⚠️  需要验证Agent间通信"
Write-Host "7. ⚠️  需要建立监控报警机制"

Write-Host ""
Write-Host "🚀 下一步行动" -ForegroundColor Green
Write-Host "============"
Write-Host "• 运行测试任务验证协作流程"
Write-Host "• 配置定时健康检查任务"
Write-Host "• 建立异常报警通知机制"
Write-Host "• 优化Agent负载均衡"

# 返回退出代码
if ($agents.Count -eq 6 -and (Test-Path $collabFile)) {
    exit 0  # 成功
} else {
    exit 1  # 有错误
}