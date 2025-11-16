package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	// 服务配置
	ServerHost string
	ServerPort int
	LogLevel   string
	LogFormat  string

	// 数据库配置
	DBPath string

	// OpenAI 配置
	OpenAIKey     string
	OpenAIBaseURL string

	// 字节豆包配置
	ArkAPIKey         string
	ArkBaseURL        string
	ArkEmbeddingModel string

	// Anthropic 配置
	AnthropicKey string

	// 向量存储配置
	VectorStoreType string
	VectorDim       int
}

func Load() (*Config, error) {
	cfg := &Config{
		ServerHost:        getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort:        getEnvInt("SERVER_PORT", 8080),
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		LogFormat:         getEnv("LOG_FORMAT", "json"),
		DBPath:            getEnv("DB_PATH", "./data/einoflow.db"),
		OpenAIKey:         getEnv("OPENAI_API_KEY", ""),
		OpenAIBaseURL:     getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		ArkAPIKey:         getEnv("ARK_API_KEY", "feabe6d9-8244-4e30-aff4-e7ad167a2ae9"),
		ArkBaseURL:        getEnv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
		ArkEmbeddingModel: getEnv("ARK_EMBEDDING_MODEL", "doubao-embedding-large-text-250515"),
		AnthropicKey:      getEnv("ANTHROPIC_API_KEY", ""),
		VectorStoreType:   getEnv("VECTOR_STORE_TYPE", "memory"),
		VectorDim:         getEnvInt("VECTOR_DIM", 1536),
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func (c *Config) Validate() error {
	if c.OpenAIKey == "" && c.ArkAPIKey == "" && c.AnthropicKey == "" {
		return fmt.Errorf("at least one LLM API key must be configured")
	}
	return nil
}
