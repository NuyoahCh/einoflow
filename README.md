# EinoFlow - 基于 Eino 的 AI 应用平台

EinoFlow 构建于字节跳动开源框架 [Eino](https://github.com/cloudwego/eino) 之上，开箱支持对话、Agent、RAG、Chain、Graph 等核心 AI 能力，并提供后端 API 与 React/Vite 前端示例，适合快速验证原型或作为二次开发的基座。

## ✨ 功能特性
- **多模型 LLM**：内置豆包（默认）、OpenAI 等提供商，支持文本/多模态与流式输出。
- **RAG 能力**：文档加载、分块、向量化与检索，默认内存向量库，便于扩展。
- **Chain & Graph 编排**：顺序链、并行链、多步骤 Graph，支持复杂流程拆解。
- **Agent 系统**：ReAct Agent + Function Calling，可插入自定义工具，多轮对话。
- **上下文与可观测性**：内置对话记忆、上下文截断、结构化日志与调用追踪。
- **前端演示**：React + Vite UI，涵盖 Chat/Agent/RAG/Graph 页面，便于集成。

## 🧭 仓库结构
```
.
├── cmd/server/main.go         # 服务入口
├── internal/                  # 核心业务逻辑
│   ├── api/                   # 路由与 Handler
│   ├── llm/                   # LLM 抽象与 Provider
│   ├── agent/                 # ReAct Agent
│   ├── chain/                 # Chain 编排
│   ├── graph/                 # Graph 任务编排
│   ├── rag/                   # 文档加载、分块、检索
│   ├── memory/                # 对话上下文管理
│   └── config/                # 配置加载
├── web/                       # React/Vite 前端示例
├── scripts/                   # 启动与测试脚本
├── docs/                      # 说明文档与指南
└── examples/                  # Go 端到端示例
```

## 🚀 快速开始
### 1) 环境准备
- Go **1.21+**（建议与 `go.mod` 保持一致）
- Node.js **18+**（使用前端示例时）

### 2) 拉取代码与依赖
```bash
git clone https://github.com/your-org/einoflow.git
cd einoflow

# 安装后端依赖
make install   # 等同于 go mod download && go mod tidy

# （可选）安装前端依赖
cd web && npm install && cd ..
```

### 3) 配置环境变量
复制示例文件并填入至少一个可用的模型 Key（推荐豆包 `ARK_API_KEY`）：
```bash
cp .env.example .env
```
常用字段说明：
- `ARK_API_KEY` / `ARK_BASE_URL`：豆包配置，默认模型 `doubao-seed-1-6-lite-251015`、`doubao-seed-1-6-vision-250815`。
- `OPENAI_API_KEY` / `OPENAI_BASE_URL`：OpenAI 备用配置（`gpt-4o`、`gpt-4o-mini` 等）。
- `SERVER_HOST` / `SERVER_PORT`：监听地址，默认 `0.0.0.0:8080`。
- `DB_PATH`：SQLite 路径，默认 `./data/einoflow.db`。
- `VECTOR_STORE_TYPE`：向量存储类型，默认 `memory`。

### 4) 启动服务
**方式 A：一键启动（推荐）**
```bash
./scripts/start-dev.sh   # 启动后端与前端，自动检查依赖
```

**方式 B：手动启动**
```bash
# 终端 1 - 启动后端
go run cmd/server/main.go

# 终端 2 - 启动前端（可选）
cd web
npm run dev
```

访问前端：`http://localhost:5173`，后端健康检查：
```bash
curl http://localhost:8080/health
```
返回 `"status":"ok"` 即表示后端正常。

## 📡 API 快速体验
以下示例使用默认豆包模型，依据需要可替换为 OpenAI 模型。

- **获取模型列表**
```bash
curl http://localhost:8080/api/v1/llm/models
```

- **基础对话**
```bash
curl -X POST http://localhost:8080/api/v1/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seed-1-6-lite-251015",
    "messages": [{"role": "user", "content": "你好，介绍一下 Eino"}]
  }'
```

- **流式对话**
```bash
curl -N -X POST http://localhost:8080/api/v1/llm/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seed-1-6-lite-251015",
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

- **Graph 多步骤分析**（执行约 3–4 分钟）
```bash
curl -X POST http://localhost:8080/api/v1/graph/run \
  -H "Content-Type: application/json" \
  -d '{"query": "如何成为优秀的 Go 开发者？", "type": "multi_step"}'
```

更多调用示例、超时时间与响应说明可参考 `QUICK_REFERENCE.md` 与 `docs/DEMO_GUIDE.md`。

## 🧪 开发与测试
```bash
# 后端测试
go test ./...

# 前端类型与构建检查（如启用前端）
cd web && npm run build
```

常用脚本：`make run`/`make test`、`scripts/test-api.sh`（API 冒烟）、`scripts/test_stream.sh`（流式检查）。

## 🛠️ 常见问题速查
- **启动失败**：检查 `.env` 是否配置了有效的 `ARK_API_KEY` 或 `OPENAI_API_KEY`，并确认 8080/5173 端口未被占用。
- **流式响应无输出**：使用 `curl -N` 或前端 SSE 客户端；确保后端终端无错误日志。
- **Graph/Agent 耗时较长**：Agent 约 1–2 分钟，Graph 约 3–4 分钟属正常，请勿频繁刷新。
- **RAG 查询为空**：先调用 `/api/v1/rag/index` 完成索引，再发起查询；默认向量库为内存，重启会清空数据。
更多排查方法见 `QUICK_REFERENCE.md` 与 `DEBUG_GUIDE.md`。

## 📚 更多资源
- `QUICK_REFERENCE.md`：快速启动、FAQ、端点与耗时参考
- `DEBUG_GUIDE.md`：调试与日志查看技巧
- `TEST_CHECKLIST.md`：回归与端到端测试清单
- `FRONTEND_IMPLEMENTATION.md` / `web/SETUP.md`：前端架构与使用说明
- `FIXES_APPLIED.md` / `FIXES_ROUND*.md`：阶段性修复与现状

欢迎提交 Issue 或 PR，一起完善 EinoFlow！
