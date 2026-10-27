package com.campus.market.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.campus.market.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.util.List;

/** 登录校验与角色鉴权 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    /** 可选登录路径：有 token 则解析，无 token 也放行 */
    private static final List<String> OPTIONAL_PATHS = List.of(
            "/api/auth/**",
            "/api/products", "/api/products/*",
            "/api/categories",
            "/api/announcements",
            "/api/reviews/user/*",
            "/api/users/*", "/api/users/*/products"
    );

    private final TokenService tokenService;
    private final AntPathMatcher matcher = new AntPathMatcher();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public static Long uid(HttpServletRequest req) {
        Object v = req.getAttribute("uid");
        return v == null ? null : (Long) v;
    }

    public static Integer role(HttpServletRequest req) {
        Object v = req.getAttribute("role");
        return v == null ? null : (Integer) v;
    }

    private boolean isOptional(String uri) {
        return OPTIONAL_PATHS.stream().anyMatch(p -> matcher.match(p, uri));
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) throws Exception {
        String uri = req.getRequestURI();
        String token = req.getHeader("Authorization");
        TokenService.TokenInfo info = tokenService.get(token);
        if (info != null) {
            req.setAttribute("uid", info.userId());
            req.setAttribute("role", info.role());
        }
        if (isOptional(uri)) {
            return true;
        }
        if (info == null) {
            writeJson(resp, 401, "未登录或登录已过期");
            return false;
        }
        if (uri.startsWith("/api/admin") && info.role() != 1) {
            writeJson(resp, 403, "无管理员权限");
            return false;
        }
        return true;
    }

    private void writeJson(HttpServletResponse resp, int status, String msg) throws Exception {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        Result<Void> r = Result.fail(msg);
        r.setCode(status);
        resp.getOutputStream().write(objectMapper.writeValueAsString(r).getBytes(StandardCharsets.UTF_8));
    }
}
