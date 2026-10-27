package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.Orders;
import com.campus.market.entity.Product;
import com.campus.market.mapper.OrderMapper;
import com.campus.market.mapper.ProductMapper;
import com.campus.market.mapper.ReviewMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import static com.campus.market.controller.ProductController.requireUid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final ReviewMapper reviewMapper;

    public OrderController(OrderMapper orderMapper, ProductMapper productMapper, ReviewMapper reviewMapper) {
        this.orderMapper = orderMapper;
        this.productMapper = productMapper;
        this.reviewMapper = reviewMapper;
    }

    @PostMapping
    public Result<Orders> create(HttpServletRequest request, @RequestBody CreateReq req) {
        Long uid = requireUid(request);
        Product p = productMapper.findById(req.getProductId());
        if (p == null || p.getStatus() != 1) throw new BizException("商品不存在或未在售");
        if (p.getUserId().equals(uid)) throw new BizException("不能购买自己的商品");
        int qty = req.getQuantity() == null ? 1 : req.getQuantity();
        if (qty < 1 || qty > p.getStock()) throw new BizException("购买数量超出库存");

        Orders o = new Orders();
        o.setOrderNo(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + String.format("%06d", ThreadLocalRandom.current().nextInt(1000000)));
        o.setProductId(p.getId());
        o.setBuyerId(uid);
        o.setSellerId(p.getUserId());
        o.setTitle(p.getTitle());
        o.setImage(p.getImages() == null ? "" : p.getImages().split(",")[0]);
        o.setPrice(p.getPrice());
        o.setQuantity(qty);
        o.setStatus(0);
        o.setMeetLocation(req.getMeetLocation() == null ? "" : req.getMeetLocation().trim());
        o.setRemark(req.getRemark() == null ? "" : req.getRemark().trim());
        orderMapper.insert(o);
        return Result.ok(orderMapper.findById(o.getId()));
    }

    @GetMapping
    public Result<List<Orders>> list(HttpServletRequest request, @RequestParam(defaultValue = "buyer") String role) {
        Long uid = requireUid(request);
        List<Orders> list = "seller".equals(role) ? orderMapper.findBySeller(uid) : orderMapper.findByBuyer(uid);
        for (Orders o : list) {
            o.setReviewed(reviewMapper.exists(o.getId(), uid) > 0);
        }
        return Result.ok(list);
    }

    /** 卖家确认接单（扣减库存） */
    @PutMapping("/{id}/accept")
    public Result<Void> accept(HttpServletRequest request, @PathVariable Long id) {
        Long uid = requireUid(request);
        Orders o = orderMapper.findById(id);
        if (o == null || !o.getSellerId().equals(uid)) throw new BizException("订单不存在或无权限");
        if (o.getStatus() != 0) throw new BizException("订单状态已变化");
        if (productMapper.decrStock(o.getProductId(), o.getQuantity()) == 0) throw new BizException("库存不足");
        if (orderMapper.updateStatus(id, 1, 0) == 0) throw new BizException("订单状态已变化");
        Product p = productMapper.findById(o.getProductId());
        if (p != null && p.getStock() <= 0) productMapper.updateStatus(p.getId(), 3);
        return Result.ok();
    }

    /** 双方可取消（待确认/待交付阶段） */
    @PutMapping("/{id}/cancel")
    public Result<Void> cancel(HttpServletRequest request, @PathVariable Long id) {
        Long uid = requireUid(request);
        Orders o = orderMapper.findById(id);
        if (o == null || (!o.getSellerId().equals(uid) && !o.getBuyerId().equals(uid))) {
            throw new BizException("订单不存在或无权限");
        }
        if (o.getStatus() != 0 && o.getStatus() != 1) throw new BizException("当前状态不可取消");
        if (orderMapper.updateStatus(id, 3, o.getStatus()) == 0) throw new BizException("订单状态已变化");
        return Result.ok();
    }

    /** 买家确认收货，交易完成 */
    @PutMapping("/{id}/complete")
    public Result<Void> complete(HttpServletRequest request, @PathVariable Long id) {
        Long uid = requireUid(request);
        Orders o = orderMapper.findById(id);
        if (o == null || !o.getBuyerId().equals(uid)) throw new BizException("订单不存在或无权限");
        if (orderMapper.updateStatus(id, 2, 1) == 0) throw new BizException("订单状态已变化");
        return Result.ok();
    }

    @Data
    public static class CreateReq {
        private Long productId;
        private Integer quantity;
        private String meetLocation;
        private String remark;
    }
}
