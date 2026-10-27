package com.campus.market.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String username;
    @JsonIgnore
    private String password;
    @JsonIgnore
    private String salt;
    private String nickname;
    private String avatar;
    private String studentId;
    private String email;
    private String phone;
    private String campus;
    /** 0 普通用户 1 管理员 */
    private Integer role;
    /** 0 正常 1 封禁 */
    private Integer status;
    /** 0 未核验 1 已核验 */
    private Integer verified;
    private LocalDateTime createdAt;
}
