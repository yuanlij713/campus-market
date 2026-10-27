package com.campus.market.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Orders {
    private Long id;
    private String orderNo;
    private Long productId;
    private Long buyerId;
    private Long sellerId;
    private String title;
    private String image;
    private BigDecimal price;
    private Integer quantity;
    /** 0 待确认 1 待交付 2 已完成 3 已取消 */
    private Integer status;
    private String meetLocation;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 关联展示字段
    private String buyerName;
    private String sellerName;
    /** 当前用户是否已评价 */
    private Boolean reviewed;
}
