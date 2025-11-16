package main

import (
	"context"
	"fmt"
	"log"

	"github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino/schema"
)

func main() {
	ctx := context.Background()

	// 创建 OpenAI 聊天模型
	chatModel, err := openai.NewChatModel(ctx, &openai.ChatModelConfig{
		APIKey: "sk-9AOKuh9ZAcsHP45IT0oCCIug2K8MIBY4bTzafFJ6F2DNaEPh",
		Model:  "gpt-4o-mini",
	})
	if err != nil {
		log.Fatal(err)
	}

	// 准备消息
	messages := []*schema.Message{
		schema.UserMessage("你好，请介绍一下 Eino 框架"),
	}

	// 调用模型
	resp, err := chatModel.Generate(ctx, messages)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("回复: %s\n", resp.Content)
	fmt.Println("调用成功")
}
