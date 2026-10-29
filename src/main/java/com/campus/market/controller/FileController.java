package com.campus.market.controller;

import com.campus.market.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileController {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp");

    private final String uploadDir;

    public FileController(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @PostMapping
    public Result<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("文件为空");
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!ALLOWED.contains(ext)) throw new IllegalArgumentException("仅支持图片文件");
        String name = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        File dir = new File(uploadDir).getAbsoluteFile();
        if (!dir.exists() && !dir.mkdirs()) throw new IOException("无法创建上传目录");
        file.transferTo(new File(dir, name));
        return Result.ok("/uploads/" + name);
    }
}
