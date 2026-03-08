# Agent记忆管理器

# 创建每日记忆日志目录
$dailyMemoryPath = "C:\Users\lenovo\.openclaw\agents\memory\daily"
if (-not (Test-Path $dailyMemoryPath)) {
    New-Item -Path $dailyMemoryPath -ItemType Directory -Force | Out-Null
}

# 创建每周记忆汇总目录
$weeklyMemoryPath = "C:\Users\lenovo\.openclaw\agents\memory\weekly"
if (-not (Test-Path $weeklyMemoryPath)) {
    New-Item -Path $weeklyMemoryPath -ItemType Directory -Force | Out-Null
}

# 今天的日期
$today = Get-Date -Format "yyyy-MM-dd"

# 为每个Agent创建今日记忆日志
$agents = @("data-analyst", "product-researcher", "promotion-specialist", "supplier-analyst", "hanai-daily-report", "main")

foreach ($agent in $agents) {
    $agentMemoryPath = "C:\Users\lenovo\.openclaw\agents\$agent\memory"
    
    # 确保Agent记忆目录存在
    if (-not (Test-Path $agentMemoryPath)) {
        New-Item -Path $agentMemoryPath -ItemType Directory -Force | Out-Null
    }
    
    # 创建今日记忆日志文件
    $dailyFile = "$agentMemoryPath\$today.md"
    if (-not (Test-Path $dailyFile)) {
        $header = "# $agent 每日记忆日志 - $today"
        $content = @"

## 📝 今日工作记录

## 🎯 完成的任务

## 📊 收集的数据

## 💡 获得的洞察

## 🤝 协作经验

## ⚠️ 遇到的问题

## 🚀 明日计划

## 📈 性能指标
- 任务处理数量: 0
- 平均处理时间: 0分钟
- 成功率: 100%
- 协作次数: 0

---
*本日志自动生成，请根据需要补充具体内容*"
        Set-Content -Path $dailyFile -Value "$header$content" -Encoding UTF8
        Write-Host "✅ 创建 $agent 今日记忆日志" -ForegroundColor Green
    }
}

# 创建系统级记忆管理文件
$systemMemoryFile = "C:\Users\lenovo\.openclaw\agents\memory\system_memory.md"
if (-not (Test-Path $systemMemoryFile)) {
    $systemContent = @"
# 🤖 多Agent系统记忆管理

## 🎯 系统配置记忆
- Agent配置版本和历史变更
- 工具权限的调整记录
- 协作协议的演进历史
- 性能优化的经验积累

## 📊 性能数据记忆
- 各Agent的任务处理统计数据
- 系统资源的长期使用趋势
- 并发处理的性能瓶颈记录
- 扩展性和稳定性历史数据

## 🤝 协作经验记忆
- 成功的协作模式案例
- 任务分发的最佳实践
- 通信协议的有效性验证
- 错误处理和恢复的经验

## ⚠️ 故障历史记忆
- 历史故障的原因分析
- 恢复策略的有效性评估
- 预警机制的优化经验
- 备份和恢复的成功案例

## 🔧 优化建议记忆
- 系统配置的优化建议
- 工具权限的调整建议
- 协作协议的改进建议
- 性能监控的优化建议

## 📋 维护记录
- 系统升级和维护记录
- 配置变更的详细记录
- 问题修复的历史记录
- 优化实施的效果记录

---
**记忆版本**: v1.0
**更新时间**: $today
**管理策略**: 定期归档，按类别整理，支持快速检索"
    Set-Content -Path $systemMemoryFile -Value $systemContent -Encoding UTF8
    Write-Host "✅ 创建系统记忆管理文件" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 记忆管理系统部署完成" -ForegroundColor Cyan
Write-Host "========================"
Write-Host "✅ 6个Agent的记忆目录结构"
Write-Host "✅ 每日记忆日志生成机制"
Write-Host "✅ 系统级记忆管理文件"
Write-Host "✅ 记忆归档和检索基础"
Write-Host ""
Write-Host "🚀 每个Agent现在都有独立的记忆存储系统！" -ForegroundColor Green