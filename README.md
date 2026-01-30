# milerliutop

基于 Go + React 的 Web 应用

## 技术栈

- **后端**: Go + Gin + MySQL + Redis
- **前端**: React + TypeScript + Vite
- **部署**: Docker + Nginx
- **数据库**: MySQL 8.0
- **缓存**: Redis 7

## 项目结构

```
web-app/
├── backend/            # Go 后端
│   ├── cmd/           # 入口文件
│   ├── config/        # 配置
│   ├── database/      # 数据库
│   ├── middleware/    # 中间件
│   ├── models/        # 数据模型
│   └── routes/        # 路由
├── frontend/          # React 前端 (Vite)
├── nginx/             # Nginx 配置
├── database/          # 数据库脚本
├── docker-compose.yml # Docker 编排
└── .env.example       # 环境变量示例
```

## 快速开始

### 1. 环境准备

确保已安装：
- Docker & Docker Compose
- Go 1.21+
- Node.js 18+

### 2. 克隆项目

```bash
git clone https://github.com/littlelk/milerliutop.git
cd milerliutop
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入配置
```

### 4. 启动服务

```bash
docker-compose up -d
```

### 5. 访问应用

- 前端: http://r.milerliu.top
- API: http://r.milerliu.top/api
- 健康检查: http://r.milerliu.top/health

## 开发

### 后端开发

```bash
cd backend
go run cmd/main.go
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

## API 文档

### 用户接口

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

## 部署到服务器

### 1. 构建前端

```bash
cd frontend
npm run build
```

### 2. 部署到服务器

```bash
# 上传项目到服务器
scp -r . user@your-server:/path/to/web-app

# 在服务器上启动
docker-compose up -d
```

### 3. 配置 HTTPS

使用 Let's Encrypt 免费证书：

```bash
docker-compose exec nginx certbot --nginx -d r.milerliu.top
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 进入容器
docker-compose exec backend sh
docker-compose exec mysql mysql -uroot -p
```

## License

MIT
