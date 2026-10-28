# 校园二手交易平台（网页版）

面向在校师生的垂直校园 C2C 二手交易平台，以"同校交易、线下交付、安全可信"为核心特色，覆盖商品发布、浏览检索、沟通交易、平台管控全流程。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Element Plus + ECharts（本地静态库，免 Node 构建） |
| 后端 | Spring Boot 3 + MyBatis，RESTful API |
| 数据库 | 默认内嵌 H2（MySQL 兼容模式，开箱即用）；生产可一键切换 MySQL 8.0 |
| 部署 | 可执行 Jar（内嵌 Tomcat）；支持 Nginx 反向代理 |

## 快速开始

要求：JDK 17+（推荐）、Maven 3.6+

```bash
# 方式一：打包运行
mvn -s settings-aliyun.xml -DskipTests package
java -jar target/campus-market-1.0.0.jar

# 方式二：直接运行
mvn -s settings-aliyun.xml spring-boot:run
```

Windows 下也可直接双击 `run.bat`。

启动后访问：

- 用户端/管理端入口：http://localhost:8080
- H2 数据库控制台：http://localhost:8080/h2-console（JDBC URL：`jdbc:h2:file:./data/campusdb`，用户名 `sa`，密码留空）

### 演示账号

| 账号 | 密码 | 角色 |
|---|---|---|
| admin | admin123 | 管理员 |
| longyihang | 123456 | 学生（九站校区） |
| huanghejun | 123456 | 学生（左家校区） |
| liangjunjia | 123456 | 学生（九站校区） |

## 切换 MySQL 8.0

```bash
mysql -uroot -p < sql/mysql-schema.sql     # 建库建表+初始管理员
# 修改 src/main/resources/application-mysql.yml 中的连接信息
java -jar target/campus-market-1.0.0.jar --spring.profiles.active=mysql
```

## 功能总览

### 用户端
- 账号体系：注册登录、学生身份核验（学号+校园邮箱）、密码找回、个人信息管理
- 商品浏览：首页推荐轮播、分类筛选、校区筛选、关键词搜索、商品详情、收藏
- 商品发布：图文发布（多图上传）、分类/价格/库存编辑、下架与重新上架、发布需审核
- 交易流程：站内私信（会话列表+实时轮询）、下单、订单状态流转（待确认→待交付→已完成/已取消）、双方互评、违规举报
- 个人中心：我的发布、我的订单（买到/卖出）、我的收藏、消息通知、账号设置

### 管理端
- 数据看板：用户/商品/订单/交易额统计，7 日订单趋势、分类分布、校区分布图表
- 内容审核：商品审核（通过/拒绝）、违规下架
- 用户管理：账号查询、封禁/解封
- 举报处理：处理举报并可联动下架商品
- 系统配置：公告发布、分类管理

## 目录结构

```
campus-market/
├── pom.xml                  # Maven 配置
├── settings-aliyun.xml      # 阿里云镜像加速配置
├── run.bat                  # Windows 一键启动
├── sql/mysql-schema.sql     # MySQL 8.0 建库脚本
├── docs/                    # 设计文档、接口文档、操作手册
├── src/main/java/com/campus/market/
│   ├── config/              # 拦截器、令牌、Web 配置
│   ├── controller/          # REST 控制器（用户/商品/订单/消息/评价/举报/管理）
│   ├── entity/              # 实体
│   ├── mapper/              # MyBatis Mapper
│   ├── common/              # 统一返回与异常处理
│   └── util/                # 密码工具
└── src/main/resources/
    ├── application.yml      # 默认配置（H2）
    ├── application-mysql.yml# MySQL 配置
    ├── schema.sql / data.sql# 建表与种子数据
    └── static/              # 前端 SPA（Vue3 + Element Plus 本地库）
```

## 性能设计

- 首屏资源全部本地化，无外部 CDN 依赖
- 商品列表分页查询，数据库常用条件建索引（MySQL 脚本）
- 静态资源 HTTP 缓存 1 小时
