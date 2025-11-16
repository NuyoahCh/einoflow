package api

import (
	"net/http"

	"einoflow/internal/agent"
	"einoflow/pkg/logger"

	"github.com/cloudwego/eino/components/model"
	"github.com/gin-gonic/gin"
)

type AgentHandler struct {
	chatModel model.ChatModel
}

func NewAgentHandler(chatModel model.ChatModel) *AgentHandler {
	return &AgentHandler{
		chatModel: chatModel,
	}
}

// AgentRequest Agent 请求
type AgentRequest struct {
	Task string `json:"task" binding:"required"`
}

// AgentResponse Agent 响应
type AgentResponse struct {
	Answer string `json:"answer"`
}

func (h *AgentHandler) Run(c *gin.Context) {
	var req AgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 创建 Agent
	reactAgent := agent.NewReActAgent(h.chatModel)

	// 执行任务
	result, err := reactAgent.Run(c.Request.Context(), req.Task)
	if err != nil {
		logger.Error("Agent execution failed: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, &AgentResponse{
		Answer: result,
	})
}
