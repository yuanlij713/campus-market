@echo off
title 校园二手交易平台
cd /d %~dp0

where java >nul 2>nul
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Java，请先安装 JDK 17 或更高版本。
  pause
  exit /b 1
)

if exist target\campus-market-1.0.0.jar (
  echo 正在启动校园二手交易平台...
  start "" http://localhost:8080
  java -jar target\campus-market-1.0.0.jar
) else (
  echo 未找到打包产物，请先执行构建命令：
  echo   mvn -s settings-aliyun.xml -DskipTests package
  pause
)