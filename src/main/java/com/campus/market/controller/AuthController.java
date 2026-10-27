package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.config.AuthInterceptor;
import com.campus.market.config.TokenService;
import com.campus.market.entity.User;
import com.campus.market.mapper.UserMapper;
import com.campus.market.util.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserMapper userMapper;
    private final TokenService tokenService;

    public AuthController(UserMapper userMapper, TokenService tokenService) {
        this.userMapper = userMapper;
        this.tokenService = tokenService;
    }

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody RegisterReq req) {
        if (req.getUsername() == null || req.getUsername().trim().length() < 3) {
            throw new BizException("用户名至少3个字符");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new BizException("密码至少6位");
        }
        if (userMapper.findByUsername(req.getUsername().trim()) != null) {
            throw new BizException("用户名已被注册");
        }
        User u = new User();
        u.setUsername(req.getUsername().trim());
        u.setSalt(PasswordUtil.randomSalt());
        u.setPassword(PasswordUtil.hash(req.getPassword(), u.getSalt()));
        u.setNickname(req.getNickname() == null || req.getNickname().isBlank() ? u.getUsername() : req.getNickname().trim());
        u.setAvatar("");
        u.setStudentId(req.getStudentId() == null ? "" : req.getStudentId().trim());
        u.setEmail(req.getEmail() == null ? "" : req.getEmail().trim());
        u.setPhone("");
        u.setCampus(req.getCampus() == null ? "" : req.getCampus().trim());
        u.setRole(0);
        u.setStatus(0);
        // 填写了学号与校园邮箱即视为已核验
        u.setVerified(!u.getStudentId().isEmpty() && !u.getEmail().isEmpty() ? 1 : 0);
        userMapper.insert(u);
        return Result.ok(loginData(u));
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginReq req) {
        User u = userMapper.findByUsername(req.getUsername() == null ? "" : req.getUsername().trim());
        if (u == null || !u.getPassword().equals(PasswordUtil.hash(req.getPassword() == null ? "" : req.getPassword(), u.getSalt()))) {
            throw new BizException("用户名或密码错误");
        }
        if (u.getStatus() == 1) {
            throw new BizException("账号已被封禁，请联系管理员");
        }
        return Result.ok(loginData(u));
    }

    @PostMapping("/forgot")
    public Result<Void> forgot(@RequestBody ForgotReq req) {
        User u = userMapper.findByStudentIdAndEmail(req.getStudentId() == null ? "" : req.getStudentId().trim(),
                req.getEmail() == null ? "" : req.getEmail().trim());
        if (u == null) {
            throw new BizException("学号与校园邮箱不匹配");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new BizException("新密码至少6位");
        }
        String salt = PasswordUtil.randomSalt();
        userMapper.updatePassword(u.getId(), PasswordUtil.hash(req.getNewPassword(), salt), salt);
        return Result.ok();
    }

    @GetMapping("/me")
    public Result<User> me(HttpServletRequest request) {
        Long uid = AuthInterceptor.uid(request);
        if (uid == null) throw new BizException("未登录");
        return Result.ok(userMapper.findById(uid));
    }

    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        tokenService.remove(request.getHeader("Authorization"));
        return Result.ok();
    }

    @PostMapping("/verify")
    public Result<Void> verify(HttpServletRequest request, @RequestBody VerifyReq req) {
        Long uid = AuthInterceptor.uid(request);
        if (uid == null) throw new BizException("未登录");
        if (req.getStudentId() == null || req.getStudentId().isBlank()) throw new BizException("请填写学号");
        if (req.getEmail() == null || !req.getEmail().contains(".")) throw new BizException("请填写有效的校园邮箱");
        userMapper.updateVerify(uid, req.getStudentId().trim(), req.getEmail().trim(), 1);
        return Result.ok();
    }

    private Map<String, Object> loginData(User u) {
        Map<String, Object> data = new HashMap<>();
        data.put("token", tokenService.create(u.getId(), u.getRole()));
        data.put("user", u);
        return data;
    }

    @Data
    public static class RegisterReq {
        @NotBlank(message = "用户名不能为空")
        private String username;
        @NotBlank(message = "密码不能为空")
        private String password;
        private String nickname;
        private String studentId;
        private String email;
        private String campus;
    }

    @Data
    public static class LoginReq {
        private String username;
        private String password;
    }

    @Data
    public static class ForgotReq {
        private String studentId;
        private String email;
        private String newPassword;
    }

    @Data
    public static class VerifyReq {
        private String studentId;
        private String email;
    }
}
