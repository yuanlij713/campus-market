package com.campus.market.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Product {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Long categoryId;
    private String campus;
    /** 逗号分隔的图片 URL */
    private String images;
    private Integer stock;
    /** 0 待审核 1 在售 2 审核拒绝 3 已下架 */
    private Integer status;
    private Integer views;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 关联展示字段
    private String categoryName;
    private String sellerName;
    private String sellerAvatar;
    private Integer sellerVerified;
}
