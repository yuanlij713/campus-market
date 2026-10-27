package com.campus.market.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Favorite {
    private Long id;
    private Long userId;
    private Long productId;
    private LocalDateTime createdAt;

    // 关联展示字段
    private String title;
    private String images;
    private BigDecimal price;
    private Integer status;
}
