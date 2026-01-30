package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/littlelk/milerliutop/models"
)

// RegisterUserRoutes 注册用户相关路由
func RegisterUserRoutes(r *gin.RouterGroup, db interface{}) {
	r.GET("/users", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "用户列表",
			"data":    []models.User{},
		})
	})

	r.POST("/users", func(c *gin.Context) {
		c.JSON(http.StatusCreated, gin.H{
			"message": "用户创建成功",
		})
	})

	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		c.JSON(http.StatusOK, gin.H{
			"message": "用户详情",
			"data": models.User{
				ID:   id,
				Name: "示例用户",
			},
		})
	})
}
