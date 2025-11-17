# EinoFlow - 基于 Eino 的 AI 应用平台

EinoFlow 是一个构建在字节跳动 [Eino](https://github.com/cloudwego/eino) 框架之上的完整 AI 应用平台，开箱即可体验 LLM 对话、Agent、RAG、Chain、Graph 等能力，并提供前后端示例、可观测性与配置管理，适合快速验证 AI 产品原型或作为二次开发的基础。

## ✨ 功能特性
- **多模型 LLM**：内置字节豆包（默认）、OpenAI 等提供商，支持文本/多模态、流式与非流式输出。
- **RAG 体系**：文档加载、分块与向量化，内置检索与基础问答能力，便于扩展向量数据库。
- **Chain & Graph 编排**：顺序链、并行链、分支链及多步骤 Graph，支持复杂业务流程组装。
- **Agent 系统**：ReAct Agent + Function Calling，可接入自定义工具，支持多轮对话。
- **Memory 与可观测性**：对话记忆、上下文窗口控制，结构化日志、请求追踪、性能与成本统计。
- **前后端示例**：后端 RESTful API，前端基于 React + Vite 的演示界面，便于二次集成。

## 🧭 项目结构
```
.
├── cmd/server/main.go         # 服务入口
├── internal/                  # 核心业务逻辑
│   ├── api/                   # 路由与各功能 Handler
│   ├── llm/                   # LLM 抽象与模型提供商
│   ├── agent/                 # ReAct Agent
│   ├── chain/                 # Chain 编排实现
│   ├── graph/                 # Graph 任务编排
│   ├── rag/                   # 文档加载、分块、检索
│   ├── memory/                # 对话历史与上下文
│   └── config/                # 配置加载
├── pkg/logger/                # 日志工具
├── web/                       # React/Vite 前端示例
├── docs/                      # 详细文档与指南
└── scripts/                   # 开发/启动脚本
```

## 🚀 快速开始
### 1. 环境准备
- Go **1.24** 及以上
- Node.js **18+**（运行前端示例）

### 2. 获取代码与依赖
```bash
# 克隆项目
git clone https://github.com/your-org/einoflow.git
cd einoflow

# 安装 Go 依赖
go mod download

# （可选）安装前端依赖
cd web && npm install
```

### 3. 配置环境变量
复制示例文件并填写密钥，至少保证字节豆包或 OpenAI 的 Key 有效：
```bash
cp .env.example .env
```
关键字段：
- `ARK_API_KEY` / `ARK_BASE_URL`：字节豆包配置（推荐）
- `OPENAI_API_KEY` / `OPENAI_BASE_URL`：OpenAI 备用配置
- `SERVER_PORT`、`SERVER_HOST`：服务监听地址
- `DB_PATH`、`VECTOR_STORE_TYPE`：存储配置

### 4. 启动服务
```bash
# 启动后端
go run cmd/server/main.go

# 可选：启动前端（另开终端）
cd web
npm run dev
```
访问前端：`http://localhost:5173`

### 5. 健康检查
```bash
curl http://localhost:8080/health
```
看到 `"status":"ok"` 即表示后端正常运行。

## 📡 API 快速体验
以下示例默认使用豆包 `ep-20241116153014-gfmhp` 模型，可根据需要替换。

- **获取模型列表**
```bash
curl http://localhost:8080/api/v1/llm/models
```

- **基础对话**
```bash
curl -X POST http://localhost:8080/api/v1/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ep-20241116153014-gfmhp",
    "messages": [{"role": "user", "content": "你好，介绍一下 Eino"}]
  }'
```

- **流式对话**
```bash
curl -N -X POST http://localhost:8080/api/v1/llm/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ep-20241116153014-gfmhp",
    "messages": [{"role": "user", "content": "写一首关于编程的诗"}]
  }'
```

- **Agent 任务**
```bash
curl -X POST http://localhost:8080/api/v1/agent/run \
  -H "Content-Type: application/json" \
  -d '{"task": "分析 Go 语言与 Python 的优缺点并给出学习建议"}'
```

- **Chain 多步骤处理**
```bash
curl -X POST http://localhost:8080/api/v1/chain/run \
  -H "Content-Type: application/json" \
  -d '{
    "steps": ["翻译成英文", "总结成一句话", "用专业语气重写"],
    "input": "Go 是一门简洁高效的编程语言"
  }'
```

- **RAG 索引与查询**
```bash
# 索引文档
curl -X POST http://localhost:8080/api/v1/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      "Eino 是字节跳动开源的 LLM 应用开发框架",
      "Eino 支持 Chain、Agent、RAG、Graph 等功能"
    ]
  }'

# 查询
curl -X POST http://localhost:8080/api/v1/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Eino 有哪些主要功能？"}'
```

- **Graph 多步骤分析**
```bash
curl -X POST http://localhost:8080/api/v1/graph/run \
  -H "Content-Type: application/json" \
  -d '{"query": "如何成为优秀的 Go 开发者？", "type": "multi_step"}'
```

更多调用示例与响应格式参见 `docs/QUICKSTART.md` 与 `docs/DEMO_GUIDE.md`。

## 🧪 开发与测试
```bash
# 运行单元测试
go test ./...

# 前端构建检查（如启用前端）
cd web
npm run build
```

## 🛠️ 常见问题速查
- 启动失败：确认 `.env` 已填写有效的 `ARK_API_KEY` 或 `OPENAI_API_KEY`。
- 流式响应无输出：使用 `curl -N`，或在前端使用 SSE 客户端。
- Graph/Agent 任务耗时：Graph 约 3-4 分钟，Agent 约 1-2 分钟，属正常现象。
- RAG 查询为空：先调用 `/api/v1/rag/index` 索引文档，再发起查询。
更多排查方法见 `docs/TROUBLESHOOTING.md` 与 `QUICK_REFERENCE.md`。

## 📚 更多资源
- `docs/PROJECT_SUMMARY.md`：功能与结构概览
- `docs/COMPLETE_IMPLEMENTATION.md`：实现细节
- `docs/ADVANCED_FEATURES_IMPLEMENTATION.md`：高级能力说明
- `docs/FINAL_STATUS.md`：当前完成度与限制

欢迎提交 Issue 或 PR，一起完善 EinoFlow！
