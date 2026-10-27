package com.campus.market.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** 简易令牌服务：内存存储，7 天有效 */
@Service
public class TokenService {

    public record TokenInfo(Long userId, Integer role, long expireAt) {}

    private final Map<String, TokenInfo> tokens = new ConcurrentHashMap<>();
    private final long expireMillis;

    public TokenService(@Value("${app.token-expire-hours:168}") long expireHours) {
        this.expireMillis = expireHours * 3600_000L;
    }

    public String create(Long userId, Integer role) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, new TokenInfo(userId, role, System.currentTimeMillis() + expireMillis));
        return token;
    }

    public TokenInfo get(String token) {
        if (token == null) return null;
        TokenInfo info = tokens.get(token);
        if (info == null) return null;
        if (info.expireAt() < System.currentTimeMillis()) {
            tokens.remove(token);
            return null;
        }
        return info;
    }

    public void remove(String token) {
        if (token != null) tokens.remove(token);
    }
}
