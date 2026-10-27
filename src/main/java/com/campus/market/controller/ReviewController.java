package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.Orders;
import com.campus.market.entity.Review;
import com.campus.market.mapper.OrderMapper;
import com.campus.market.mapper.ReviewMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.campus.market.controller.ProductController.requireUid;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewMapper reviewMapper;
    private final OrderMapper orderMapper;

    public ReviewController(ReviewMapper reviewMapper, OrderMapper orderMapper) {
        this.reviewMapper = reviewMapper;
        this.orderMapper = orderMapper;
    }

    @PostMapping
    public Result<Void> create(HttpServletRequest request, @RequestBody ReviewReq req) {
        Long uid = requireUid(request);
        Orders o = orderMapper.findById(req.getOrderId());
        if (o == null) throw new BizException("订单不存在");
        if (o.getStatus() != 2) throw new BizException("订单完成后才能评价");
        Long targetId = o.getBuyerId().equals(uid) ? o.getSellerId()
                : o.getSellerId().equals(uid) ? o.getBuyerId() : null;
        if (targetId == null) throw new BizException("无权评价该订单");
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) throw new BizException("评分需为1-5星");
        if (reviewMapper.exists(o.getId(), uid) > 0) throw new BizException("已评价过该订单");
        Review r = new Review();
        r.setOrderId(o.getId());
        r.setReviewerId(uid);
        r.setTargetId(targetId);
        r.setRating(req.getRating());
        r.setContent(req.getContent() == null ? "" : req.getContent().trim());
        reviewMapper.insert(r);
        return Result.ok();
    }

    @GetMapping("/user/{userId}")
    public Result<List<Review>> listByUser(@PathVariable Long userId) {
        return Result.ok(reviewMapper.findByTarget(userId));
    }

    @Data
    public static class ReviewReq {
        private Long orderId;
        private Integer rating;
        private String content;
    }
}
