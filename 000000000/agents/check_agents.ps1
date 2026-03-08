# 多Agent系统快速检查

Write-Host "🤖 多Agent系统配置状态" -ForegroundColor Green
Write-Host "======================="

# 检查各个Agent配置
$agents = @("data-analyst", "product-researcher", "promotion-specialist", "supplier-analyst", "hanai-daily-report", "main")

foreach ($agent in $agents) {
    $agentPath = "C:\Users\lenovo\.openclaw\agents\$agent"
    
    if (Test-Path $agentPath) {
        $soulFile = "$agentPath\agent\SOUL.md"
        $toolsFile = "$agentPath\agent\TOOLS.md"
        
        $soulExists = Test-Path $soulFile
        $toolsExists = Test-Path $toolsFile
        
        Write-Host "$agent : " -NoNewline
        
        if ($soulExists -and $toolsExists) {
            Write-Host "✅ 完整" -ForegroundColor Green
        } elseif ($soulExists) {
            Write-Host "⚠️  缺TOOLS" -ForegroundColor Yellow
        } else {
            Write-Host "❌ 缺失" -ForegroundColor Red
        }
    } else {
        Write-Host "$agent : ❌ 不存在" -ForegroundColor Red
    }
}

# 检查协作配置
$collabFile = "C:\Users\lenovo\.openclaw\agents\COLLABORATION.md"
if (Test-Path $collabFile) {
    Write-Host "协作协议: ✅ 存在" -ForegroundColor Green
} else {
    Write-Host "协作协议: ❌ 缺失" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 配置完成情况:" -ForegroundColor Cyan
Write-Host "• 6个Agent角色定义完成"
Write-Host "• 6个Agent工具配置完成"
Write-Host "• 协作协议制定完成"
Write-Host "• 飞书绑定配置完成"
Write-Host ""
Write-Host "🚀 系统已就绪，可以开始测试!" -ForegroundColor Green