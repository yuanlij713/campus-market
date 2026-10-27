package com.campus.market.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Review {
    private Long id;
    private Long orderId;
    private Long reviewerId;
    private Long targetId;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;

    // 关联展示字段
    private String reviewerName;
    private String reviewerAvatar;
}
