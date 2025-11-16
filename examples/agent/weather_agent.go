package main

import (
	"context"
	"fmt"
	"log"

	"einoflow/internal/agent"
	"einoflow/internal/tools"

	"github.com/cloudwego/eino-ext/components/model/openai"
)

func main() {
	ctx := context.Background()

	// 创建聊天模型
	chatModel, err := openai.NewChatModel(ctx, &openai.ChatModelConfig{
		APIKey: "sk-9AOKuh9ZAcsHP45IT0oCCIug2K8MIBY4bTzafFJ6F2DNaEPh",
		Model:  "gpt-4o-mini",
	})
	if err != nil {
		log.Fatal(err)
	}

	// 创建工具注册表
	registry := tools.NewRegistry("", "./data/documents")
	_ = registry.GetByNames([]string{"weather", "calculator"}) // 工具列表（当前简化版本不使用）

	// 创建 Agent
	reactAgent := agent.NewReActAgent(chatModel)

	// 执行任务
	result, err := reactAgent.Run(ctx, "北京今天的天气怎么样？")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Agent 回复: %s\n", result)
}
