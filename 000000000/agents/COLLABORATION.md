# 🤝 多Agent协作协议

## 🎯 协作原则

### 核心原则
1. **专业分工** - 每个Agent专注特定领域
2. **高效协作** - 任务无缝传递和整合
3. **数据共享** - 信息在Agent间安全共享
4. **统一报告** - 最终输出统一格式

## 🔄 协作流程

### 标准任务流程
```
大王/系统 → 主智能体 → 专业Agent → 结果汇总 → 大王
```

### 具体步骤
1. **任务接收**: 主智能体接收任务请求
2. **任务分析**: 分析任务类型和需求
3. **Agent选择**: 选择最合适的专业Agent
4. **任务分发**: 通过 sessions_spawn 分发任务
5. **执行监控**: 监控任务执行进度
6. **结果收集**: 收集各Agent的输出结果
7. **报告整合**: 整合成完整的任务报告
8. **最终交付**: 向大王交付最终结果

## 📨 通信协议

### 任务请求格式
```json
{
  "task_id": "unique_task_identifier",
  "task_type": "data_analysis|product_research|promotion|supplier_analysis",
  "priority": "P0|P1|P2|P3",
  "deadline": "2026-03-06T12:00:00",
  "requirements": "具体的任务要求",
  "input_data": {"key": "value"},
  "expected_output": "期望的输出格式"
}
```

### 进度汇报格式
```json
{
  "task_id": "unique_task_identifier",
  "agent_id": "executing_agent",
  "status": "running|completed|failed",
  "progress": 50,
  "estimated_completion": "2026-03-06T10:30:00",
  "current_results": {"key": "partial_result"},
  "issues": []
}
```

### 完成通知格式
```json
{
  "task_id": "unique_task_identifier",
  "agent_id": "executing_agent",
  "status": "completed",
  "completion_time": "2026-03-06T10:25:00",
  "results": {"key": "final_result"},
  "output_files": ["path/to/report.md"],
  "next_steps": []
}
```

## 🏗️ 协作模式

### 1. 串行协作
```
AgentA → AgentB → AgentC → 最终结果
```
- 适用于多步骤复杂任务
- 每个Agent处理特定环节

### 2. 并行协作  
```
     → AgentA
任务 → AgentB → 结果整合
     → AgentC
```
- 适用于大数据量任务
- 提高处理效率

### 3. 混合协作
```
任务 → AgentA → AgentB
            → AgentC → 结果整合
```
- 结合串行和并行优势
- 处理复杂多层次任务

## ⚙️ 配置管理

### Agent能力矩阵
| Agent | 核心能力 | 协作角色 |
|-------|----------|----------|
| main | 系统协调、任务分发 | 总指挥 |
| data-analyst | 数据分析、洞察发现 | 数据分析师 |
| product-researcher | 产品发现、市场监控 | 选品专家 |
| promotion-specialist | 内容创作、推广发布 | 营销专家 |
| supplier-analyst | 供应商评估、风险分析 | 采购专家 |
| hanai-daily-report | 内容生成、定时发布 | 内容生产者 |

### 任务类型映射
- **数据分析任务** → data-analyst
- **产品研究任务** → product-researcher  
- **推广营销任务** → promotion-specialist
- **供应商评估任务** → supplier-analyst
- **内容生产任务** → hanai-daily-report
- **复杂综合任务** → 多Agent协作

## 📊 性能监控

### 协作指标
- 任务响应时间 < 5分钟
- 任务完成率 > 95%
- 协作效率 > 80%
- 错误率 < 5%

### 质量指标
- 输出准确性 > 90%
- 报告完整性 > 95%
- 用户满意度 > 4/5

## 🔐 安全规范

### 数据安全
- 敏感数据加密传输
- 权限分级控制
- 操作日志记录

### 系统安全
- Agent间身份验证
- 任务来源验证
- 异常行为监控

---
**协议版本**: v1.0
**生效时间**: 2026-03-06
**更新记录**: 初始版本制定