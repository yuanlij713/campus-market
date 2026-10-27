package com.campus.market.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Report {
    private Long id;
    private Long reporterId;
    private Long productId;
    private String reason;
    /** 0 待处理 1 已处理 */
    private Integer status;
    private String handleResult;
    private LocalDateTime createdAt;

    // 关联展示字段
    private String reporterName;
    private String productTitle;
}
