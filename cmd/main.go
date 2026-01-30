package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/littlelk/milerliutop/config"
	"github.com/littlelk/milerliutop/database"
	"github.com/littlelk/milerliutop/routes"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 连接数据库
	db, err := database.NewMySQL(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer db.Close()

	// 初始化 Gin
	r := gin.Default()

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "服务运行正常",
		})
	})

	// API 路由
	api := r.Group("/api")
	{
		routes.RegisterUserRoutes(api, db)
		// 在这里添加更多路由
	}

	// 启动服务器
	addr := ":" + cfg.ServerPort
	log.Printf("🚀 服务器启动在 http://%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
