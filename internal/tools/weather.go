package tools

import (
	"context"
	"encoding/json"
)

// WeatherTool 天气查询工具
type WeatherTool struct{}

// NewWeatherTool 创建天气工具
func NewWeatherTool() *WeatherTool {
	return &WeatherTool{}
}

// GetWeather 获取天气信息
// @tool Get current weather for a location
func (t *WeatherTool) GetWeather(ctx context.Context, location string) (string, error) {
	// 模拟天气查询
	weather := map[string]interface{}{
		"location":    location,
		"temperature": "22°C",
		"condition":   "Sunny",
		"humidity":    "65%",
	}

	data, err := json.Marshal(weather)
	if err != nil {
		return "", err
	}

	return string(data), nil
}
