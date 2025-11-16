# EinoFlow - 基于 Eino 的 AI 应用平台

一个全面的 AI 应用平台，基于字节跳动的 [Eino](https://github.com/cloudwego/eino) 框架构建，涵盖 LLM、RAG、Agent 等核心功能。

## 功能特性

### 🤖 LLM 集成
- 支持多个模型提供商（OpenAI、Anthropic、字节豆包等）
- 流式和非流式响应
- 多模态支持（文本、图像）

### 📚 RAG 系统
- 文档加载和解析
- 文本分块和向量化
- 向量数据库集成
- 检索增强生成

### 🔗 Chain 编排
- 顺序链（Sequential Chain）
- 并行链（Parallel Chain）
- 条件链（Branch Chain）
- Lambda 链

### 🛠️ Agent 系统
- ReAct Agent
- Function Calling
- 自定义工具集成
- 多轮对话

### 💾 Memory 管理
- 对话历史管理
- 上下文窗口控制
- 持久化存储

### 📊 可观测性
- 结构化日志
- 请求追踪
- 性能监控
- 成本统计

## 快速开始

### 1. 安装依赖

```bash
go mod download