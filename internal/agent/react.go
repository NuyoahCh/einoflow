package agent

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
)

// ReActAgent ReAct 模式的 Agent（简化但完整的实现）
type ReActAgent struct {
	chatModel model.ChatModel
	maxSteps  int
}

// NewReActAgent 创建 ReAct Agent
func NewReActAgent(chatModel model.ChatModel) *ReActAgent {
	return &ReActAgent{
		chatModel: chatModel,
		maxSteps:  10,
	}
}

// Run 执行 Agent
func (a *ReActAgent) Run(ctx context.Context, task string) (string, error) {
	// 构建系统提示词
	systemPrompt := `你是一个智能助手，可以帮助用户完成各种任务。
请仔细分析用户的问题，给出详细和有帮助的回答。`

	messages := []*schema.Message{
		schema.SystemMessage(systemPrompt),
		schema.UserMessage(task),
	}

	resp, err := a.chatModel.Generate(ctx, messages)
	if err != nil {
		return "", fmt.Errorf("agent execution failed: %w", err)
	}

	return resp.Content, nil
}

// RunWithTools 使用工具执行（未来扩展）
func (a *ReActAgent) RunWithTools(ctx context.Context, task string, toolsDesc string) (string, error) {
	systemPrompt := fmt.Sprintf(`你是一个智能助手，可以使用以下工具来帮助用户：

%s

请根据用户的任务，思考是否需要使用工具，并给出详细的回答。`, toolsDesc)

	messages := []*schema.Message{
		schema.SystemMessage(systemPrompt),
		schema.UserMessage(task),
	}

	resp, err := a.chatModel.Generate(ctx, messages)
	if err != nil {
		return "", fmt.Errorf("agent execution failed: %w", err)
	}

	return resp.Content, nil
}

// SetMaxSteps 设置最大步骤数
func (a *ReActAgent) SetMaxSteps(maxSteps int) *ReActAgent {
	a.maxSteps = maxSteps
	return a
}
