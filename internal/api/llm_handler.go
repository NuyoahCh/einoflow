package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"einoflow/internal/llm"
	"einoflow/internal/memory"
	"einoflow/pkg/logger"

	"github.com/gin-gonic/gin"
)

type LLMHandler struct {
	manager        *llm.Manager
	contextManager *memory.ContextManager
}

func NewLLMHandler(manager *llm.Manager) *LLMHandler {
	// 创建上下文管理器（4096 tokens，适合大多数模型）
	ctxMgr, err := memory.NewContextManager(4096)
	if err != nil {
		logger.Warn(fmt.Sprintf("Failed to create context manager: %v", err))
	}

	return &LLMHandler{
		manager:        manager,
		contextManager: ctxMgr,
	}
}

func (h *LLMHandler) Chat(c *gin.Context) {
	var req llm.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 截断消息以适应上下文窗口
	if h.contextManager != nil {
		originalCount := len(req.Messages)
		req.Messages = h.contextManager.TruncateMessages(req.Messages)
		if len(req.Messages) < originalCount {
			logger.Info(fmt.Sprintf("Context truncated: %d -> %d messages, tokens: %d, available: %d",
				originalCount, len(req.Messages),
				h.contextManager.CountTokens(req.Messages),
				h.contextManager.GetAvailableTokens(req.Messages)))
		}
	}

	resp, err := h.manager.Chat(c.Request.Context(), &req)
	if err != nil {
		logger.Error("Chat failed: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *LLMHandler) ChatStream(c *gin.Context) {
	var req llm.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 截断消息以适应上下文窗口
	if h.contextManager != nil {
		originalCount := len(req.Messages)
		req.Messages = h.contextManager.TruncateMessages(req.Messages)
		if len(req.Messages) < originalCount {
			logger.Info(fmt.Sprintf("Stream context truncated: %d -> %d messages",
				originalCount, len(req.Messages)))
		}
	}

	req.Stream = true

	// 设置 SSE 头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	// 获取流式响应
	stream, err := h.manager.ChatStream(c.Request.Context(), &req)
	if err != nil {
		logger.Error("ChatStream failed: " + err.Error())
		c.SSEvent("error", gin.H{"error": err.Error()})
		return
	}

	// 处理流式响应
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "streaming not supported"})
		return
	}

	err = llm.ProcessStream(c.Request.Context(), stream, func(chunk *llm.StreamChunk) error {
		data, _ := json.Marshal(chunk)
		fmt.Fprintf(c.Writer, "data: %s\n\n", data)
		flusher.Flush()
		return nil
	})

	if err != nil {
		logger.Error("Stream processing failed: " + err.Error())
	}
}

func (h *LLMHandler) ListModels(c *gin.Context) {
	providerName := c.Query("provider")

	if providerName != "" {
		// 获取特定提供商的模型
		provider, ok := h.manager.GetProvider(providerName)
		if !ok {
			c.JSON(http.StatusNotFound, gin.H{"error": "provider not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"provider": providerName,
			"models":   provider.ListModels(),
		})
		return
	}

	// 返回所有提供商的模型，转换为前端期望的格式
	type ModelInfo struct {
		ID       string `json:"id"`
		Provider string `json:"provider"`
		Name     string `json:"name"`
	}

	var models []ModelInfo
	for providerName, provider := range h.manager.GetAllProviders() {
		modelIDs := provider.ListModels()
		for _, modelID := range modelIDs {
			models = append(models, ModelInfo{
				ID:       modelID,
				Provider: providerName,
				Name:     modelID, // 可以后续优化为更友好的名称
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"models": models,
	})
}
