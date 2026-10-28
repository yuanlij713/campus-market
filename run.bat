@echo off
title 校园二手交易平台
cd /d "%~dp0"

set "JAVA_EXE="

if defined JAVA_HOME (
  if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

if not defined JAVA_EXE (
  for /d %%D in ("%USERPROFILE%\.jdks\*") do (
    if exist "%%D\bin\java.exe" (
      set "JAVA_EXE=%%D\bin\java.exe"
      goto :found
    )
  )
)

if not defined JAVA_EXE (
  for /d %%D in ("C:\Program Files\Java\*") do (
    if exist "%%D\bin\java.exe" (
      set "JAVA_EXE=%%D\bin\java.exe"
      goto :found
    )
  )
)

if not defined JAVA_EXE (
  for /d %%D in ("C:\Program Files\Eclipse Adoptium\*") do (
    if exist "%%D\bin\java.exe" (
      set "JAVA_EXE=%%D\bin\java.exe"
      goto :found
    )
  )
)

if not defined JAVA_EXE (
  where java >nul 2>nul && set "JAVA_EXE=java"
)

:found
if not defined JAVA_EXE (
  echo [错误] 未找到 Java 运行环境，请安装 JDK 17 或更高版本。
  pause
  exit /b 1
)

echo 使用 Java: %JAVA_EXE%
"%JAVA_EXE%" -version 2>nul
echo.

if not exist target\campus-market-1.0.0.jar (
  echo 未找到打包产物 target\campus-market-1.0.0.jar
  echo 请先在项目目录执行: mvn -s settings-aliyun.xml -DskipTests package
  pause
  exit /b 1
)

echo 正在启动校园二手交易平台...
start "" http://localhost:8080
"%JAVA_EXE%" -jar target\campus-market-1.0.0.jar
if errorlevel 1 (
  echo.
  echo [启动失败] 应用异常退出，错误码: %errorlevel%
  pause
)