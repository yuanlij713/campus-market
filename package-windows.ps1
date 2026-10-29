# 打包 Windows 免安装版（自带 Java 运行环境，双击 exe 即可运行）
# 用法：在项目根目录执行  powershell -ExecutionPolicy Bypass -File package-windows.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# 自动查找 jpackage（优先 JAVA_HOME，其次 PATH，其次 ~/.jdks）
$jpackage = $null
$jpCmd = Get-Command jpackage.exe -ErrorAction SilentlyContinue
if ($jpCmd) { $jpackage = $jpCmd.Source }
if (-not $jpackage -and $env:JAVA_HOME) {
    $p = Join-Path $env:JAVA_HOME "bin\jpackage.exe"
    if (Test-Path $p) { $jpackage = $p }
}
if (-not $jpackage -and (Test-Path (Join-Path $env:USERPROFILE ".jdks"))) {
    foreach ($d in Get-ChildItem (Join-Path $env:USERPROFILE ".jdks") -Directory) {
        $p = Join-Path $d.FullName "bin\jpackage.exe"
        if (Test-Path $p) { $jpackage = $p; break }
    }
}

# 自动查找 Maven
$mvn = $null
$mvnCmd = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if ($mvnCmd) { $mvn = $mvnCmd.Source }
if (-not $mvn -and (Test-Path "D:\cxdownload\apache-maven-3.8.6\bin\mvn.cmd")) {
    $mvn = "D:\cxdownload\apache-maven-3.8.6\bin\mvn.cmd"
}
if (-not $mvn) { throw "未找到 Maven，请安装 Maven 或把它加入 PATH" }

$release = Join-Path $root "release"
$appName = "CampusMarket"
$version = "1.0.0"
$outDir = Join-Path $release $appName
$stage = Join-Path $root "target\jpackage-input"
$icon = Join-Path $root "target\app.ico"

if (-not (Test-Path $jpackage)) { throw "未找到 jpackage：$jpackage" }

Write-Host "[1/6] Maven 打包 ..."
& $mvn -s settings-aliyun.xml -q -DskipTests package
if ($LASTEXITCODE -ne 0) { throw "Maven 打包失败" }

Write-Host "[2/6] 准备打包输入目录 ..."
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $stage | Out-Null
Copy-Item "target\campus-market-$version.jar" $stage

Write-Host "[3/6] 生成程序图标 ..."
Add-Type -AssemblyName System.Drawing
$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

$rect = New-Object System.Drawing.Rectangle 8, 8, 240, 240
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect,
    ([System.Drawing.Color]::FromArgb(255, 64, 158, 255)),
    ([System.Drawing.Color]::FromArgb(255, 24, 82, 168)), 45
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 40
$path.AddArc(8, 8, $r * 2, $r * 2, 180, 90)
$path.AddArc(248 - $r * 2, 8, $r * 2, $r * 2, 270, 90)
$path.AddArc(248 - $r * 2, 248 - $r * 2, $r * 2, $r * 2, 0, 90)
$path.AddArc(8, 248 - $r * 2, $r * 2, $r * 2, 90, 90)
$path.CloseFigure()
$g.FillPath($brush, $path)

$font = New-Object System.Drawing.Font("Microsoft YaHei", 132, [System.Drawing.FontStyle]::Bold)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("校", $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 8, 8, 240, 240), $fmt)
$g.Dispose()

$pngPath = Join-Path $root "target\app.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# PNG 压缩格式的 ICO（Windows Vista 及以上支持）
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1)
$bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
$bw.Write([UInt16]1); $bw.Write([UInt16]32)
$bw.Write([UInt32]$pngBytes.Length); $bw.Write([UInt32]22)
$bw.Write($pngBytes); $bw.Flush()
[System.IO.File]::WriteAllBytes($icon, $ms.ToArray())
$bw.Dispose(); $ms.Dispose()

Write-Host "[4/6] jpackage 生成免安装程序 ..."
Remove-Item -Recurse -Force $outDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $release | Out-Null
& $jpackage --type app-image `
    --name $appName `
    --app-version $version `
    --vendor "吉林农业科技学院" `
    --description "校园二手交易平台" `
    --input $stage `
    --main-jar "campus-market-$version.jar" `
    --main-class "org.springframework.boot.loader.launch.JarLauncher" `
    --dest $release `
    --icon $icon `
    --java-options "-Dfile.encoding=UTF-8" `
    --java-options "-Dapp.open-browser=true" `
    --java-options "-Xmx512m"
if ($LASTEXITCODE -ne 0) { throw "jpackage 打包失败" }

Write-Host "[5/6] 生成使用说明 ..."
$readme = @"
校园二手交易平台 1.0.0（Windows 免安装版）

一、如何运行
1. 双击本文件夹中的 CampusMarket.exe 即可启动，程序会自动打开浏览器 http://localhost:8080
2. 首次启动会在本文件夹内自动创建 data 目录（数据库文件）和 uploads 目录（上传的图片）
3. 关闭启动窗口或结束 CampusMarket 进程即可退出程序

二、演示账号
管理员：admin / admin123
学生：longyihang / 123456（九站校区）
学生：huanghejun / 123456（左家校区）
学生：liangjunjia / 123456（九站校区）

三、数据备份与迁移
data 和 uploads 两个目录保存了全部数据。备份或换电脑时，把整个文件夹复制过去即可，数据不会丢失。

四、常见问题
1. 双击后浏览器没有自动打开：手动访问 http://localhost:8080 即可
2. 提示端口被占用：说明程序已经在运行，直接打开浏览器访问即可
3. 不要在运行时删除或移动 data 目录，否则可能损坏数据
"@
[System.IO.File]::WriteAllText((Join-Path $outDir "使用说明.txt"), $readme, (New-Object System.Text.UTF8Encoding $false))

Write-Host "[6/6] 压缩为 zip ..."
$zip = Join-Path $release "$appName-$version-win64.zip"
Remove-Item $zip -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $outDir -DestinationPath $zip -CompressionLevel Optimal

Write-Host "完成：$outDir"
Write-Host "可执行文件：$(Join-Path $outDir "$appName.exe")"
Write-Host "分发包：$zip"
