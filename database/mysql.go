package database

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
	"github.com/littlelk/milerliutop/config"
)

// NewMySQL 创建 MySQL 连接
func NewMySQL(cfg *config.Config) (*sql.DB, error) {
	dsn := cfg.DSN()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("数据库连接失败: %v", err)
	}

	// 测试连接
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("数据库 Ping 失败: %v", err)
	}

	// 设置连接池
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	fmt.Println("✅ MySQL 数据库连接成功")
	return db, nil
}
