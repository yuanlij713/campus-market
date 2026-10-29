package com.campus.market;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.awt.Desktop;
import java.io.IOException;
import java.net.Socket;
import java.net.URI;

@SpringBootApplication
@MapperScan("com.campus.market.mapper")
public class CampusMarketApplication {

    public static void main(String[] args) {
        if (Boolean.getBoolean("app.open-browser")) {
            // 桌面版：已有实例占用端口时直接打开浏览器，否则启动后自动打开
            if (portInUse()) {
                openBrowser();
                return;
            }
            SpringApplication app = new SpringApplication(CampusMarketApplication.class);
            app.addListeners((ApplicationReadyEvent event) -> openBrowser());
            app.run(args);
            return;
        }
        SpringApplication.run(CampusMarketApplication.class, args);
    }

    private static boolean portInUse() {
        try (Socket socket = new Socket("127.0.0.1", 8080)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private static void openBrowser() {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(URI.create("http://localhost:8080"));
            }
        } catch (Exception ignored) {
            // 无桌面环境时忽略
        }
    }
}
