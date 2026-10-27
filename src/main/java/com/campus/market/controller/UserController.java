package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.config.AuthInterceptor;
import com.campus.market.entity.User;
import com.campus.market.mapper.ReviewMapper;
import com.campus.market.mapper.UserMapper;
import com.campus.market.util.PasswordUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserMapper userMapper;
    private final ReviewMapper reviewMapper;

    public UserController(UserMapper userMapper, ReviewMapper reviewMapper) {
        this.userMapper = userMapper;
        this.reviewMapper = reviewMapper;
    }

    /** 公开卖家信息 */
    @GetMapping("/users/{id}")
    public Result<Map<String, Object>> publicInfo(@PathVariable Long id) {
        User u = userMapper.findById(id);
        if (u == null) throw new BizException("用户不存在");
        Map<String, Object> data = new HashMap<>();
        data.put("id", u.getId());
        data.put("nickname", u.getNickname());
        data.put("avatar", u.getAvatar());
        data.put("campus", u.getCampus());
        data.put("verified", u.getVerified());
        data.put("createdAt", u.getCreatedAt());
        data.put("avgRating", reviewMapper.avgRating(id));
        return Result.ok(data);
    }

    @PutMapping("/user/profile")
    public Result<Void> updateProfile(HttpServletRequest request, @RequestBody ProfileReq req) {
        Long uid = AuthInterceptor.uid(request);
        if (uid == null) throw new BizException("未登录");
        User u = userMapper.findById(uid);
        u.setNickname(req.getNickname() == null || req.getNickname().isBlank() ? u.getNickname() : req.getNickname().trim());
        u.setAvatar(req.getAvatar() == null ? u.getAvatar() : req.getAvatar());
        u.setPhone(req.getPhone() == null ? u.getPhone() : req.getPhone().trim());
        u.setCampus(req.getCampus() == null ? u.getCampus() : req.getCampus().trim());
        userMapper.updateProfile(u);
        return Result.ok();
    }

    @PutMapping("/user/password")
    public Result<Void> updatePassword(HttpServletRequest request, @RequestBody PwdReq req) {
        Long uid = AuthInterceptor.uid(request);
        if (uid == null) throw new BizException("未登录");
        User u = userMapper.findById(uid);
        if (!u.getPassword().equals(PasswordUtil.hash(req.getOldPassword() == null ? "" : req.getOldPassword(), u.getSalt()))) {
            throw new BizException("原密码错误");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new BizException("新密码至少6位");
        }
        String salt = PasswordUtil.randomSalt();
        userMapper.updatePassword(uid, PasswordUtil.hash(req.getNewPassword(), salt), salt);
        return Result.ok();
    }

    @Data
    public static class ProfileReq {
        private String nickname;
        private String avatar;
        private String phone;
        private String campus;
    }

    @Data
    public static class PwdReq {
        private String oldPassword;
        private String newPassword;
    }
}
