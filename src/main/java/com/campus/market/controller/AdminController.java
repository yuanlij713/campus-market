package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.*;
import com.campus.market.mapper.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 管理端接口（需管理员角色，由 AuthInterceptor 统一校验） */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;
    private final ReportMapper reportMapper;
    private final CategoryMapper categoryMapper;
    private final AnnouncementMapper announcementMapper;

    public AdminController(UserMapper userMapper, ProductMapper productMapper, OrderMapper orderMapper,
                           ReportMapper reportMapper, CategoryMapper categoryMapper, AnnouncementMapper announcementMapper) {
        this.userMapper = userMapper;
        this.productMapper = productMapper;
        this.orderMapper = orderMapper;
        this.reportMapper = reportMapper;
        this.categoryMapper = categoryMapper;
        this.announcementMapper = announcementMapper;
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> data = new HashMap<>();
        data.put("userCount", userMapper.totalCount());
        data.put("productCount", productMapper.totalCount());
        data.put("orderCount", orderMapper.totalCount());
        data.put("orderAmount", orderMapper.totalAmount());
        data.put("pendingProductCount", productMapper.pendingCount());
        data.put("pendingReportCount", reportMapper.pendingCount());
        return Result.ok(data);
    }

    @GetMapping("/stats/trend")
    public Result<Map<String, Object>> trend() {
        Map<String, Object> data = new HashMap<>();
        data.put("orderTrend", orderMapper.trend7d(java.time.LocalDate.now().minusDays(6).atStartOfDay()));
        data.put("categoryDist", productMapper.countByCategory());
        data.put("campusDist", productMapper.countByCampus());
        return Result.ok(data);
    }

    @GetMapping("/products")
    public Result<Map<String, Object>> products(@RequestParam(required = false) Integer status,
                                                @RequestParam(required = false) String keyword,
                                                @RequestParam(defaultValue = "1") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        size = Math.min(Math.max(size, 1), 50);
        int offset = (Math.max(page, 1) - 1) * size;
        Map<String, Object> data = new HashMap<>();
        data.put("list", productMapper.page(status, null, null, null, keyword, offset, size));
        data.put("total", productMapper.count(status, null, null, null, keyword));
        return Result.ok(data);
    }

    @PutMapping("/products/{id}/approve")
    public Result<Void> approve(@PathVariable Long id) {
        requireProduct(id);
        productMapper.updateStatus(id, 1);
        return Result.ok();
    }

    @PutMapping("/products/{id}/reject")
    public Result<Void> reject(@PathVariable Long id) {
        requireProduct(id);
        productMapper.updateStatus(id, 2);
        return Result.ok();
    }

    @PutMapping("/products/{id}/offshelf")
    public Result<Void> offshelf(@PathVariable Long id) {
        requireProduct(id);
        productMapper.updateStatus(id, 3);
        return Result.ok();
    }

    @GetMapping("/users")
    public Result<Map<String, Object>> users(@RequestParam(required = false) String keyword,
                                             @RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        size = Math.min(Math.max(size, 1), 50);
        int offset = (Math.max(page, 1) - 1) * size;
        Map<String, Object> data = new HashMap<>();
        data.put("list", userMapper.page(keyword, offset, size));
        data.put("total", userMapper.count(keyword));
        return Result.ok(data);
    }

    @PutMapping("/users/{id}/ban")
    public Result<Void> ban(@PathVariable Long id) {
        User u = userMapper.findById(id);
        if (u == null) throw new BizException("用户不存在");
        if (u.getRole() == 1) throw new BizException("不能封禁管理员");
        userMapper.updateStatus(id, 1);
        return Result.ok();
    }

    @PutMapping("/users/{id}/unban")
    public Result<Void> unban(@PathVariable Long id) {
        if (userMapper.findById(id) == null) throw new BizException("用户不存在");
        userMapper.updateStatus(id, 0);
        return Result.ok();
    }

    @GetMapping("/reports")
    public Result<List<Report>> reports() {
        return Result.ok(reportMapper.findAll());
    }

    @PutMapping("/reports/{id}/handle")
    public Result<Void> handleReport(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String result = body.getOrDefault("result", "").toString();
        boolean takedown = Boolean.parseBoolean(String.valueOf(body.getOrDefault("takedown", "false")));
        reportMapper.handle(id, result.isBlank() ? (takedown ? "已下架商品" : "举报不成立") : result);
        if (takedown) {
            Report report = reportMapper.findAll().stream().filter(r -> r.getId().equals(id)).findFirst().orElse(null);
            if (report != null) productMapper.updateStatus(report.getProductId(), 3);
        }
        return Result.ok();
    }

    @GetMapping("/announcements")
    public Result<List<Announcement>> announcements() {
        return Result.ok(announcementMapper.findAll());
    }

    @PostMapping("/announcements")
    public Result<Void> addAnnouncement(@RequestBody Announcement a) {
        if (a.getTitle() == null || a.getTitle().isBlank()) throw new BizException("标题不能为空");
        announcementMapper.insert(a);
        return Result.ok();
    }

    @PutMapping("/announcements/{id}")
    public Result<Void> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement a) {
        a.setId(id);
        announcementMapper.update(a);
        return Result.ok();
    }

    @DeleteMapping("/announcements/{id}")
    public Result<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementMapper.delete(id);
        return Result.ok();
    }

    @GetMapping("/categories")
    public Result<List<Category>> categories() {
        return Result.ok(categoryMapper.findAll());
    }

    @PostMapping("/categories")
    public Result<Void> addCategory(@RequestBody Category c) {
        if (c.getName() == null || c.getName().isBlank()) throw new BizException("名称不能为空");
        if (c.getParentId() == null) c.setParentId(0L);
        if (c.getSort() == null) c.setSort(0);
        categoryMapper.insert(c);
        return Result.ok();
    }

    @PutMapping("/categories/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestBody Category c) {
        c.setId(id);
        categoryMapper.update(c);
        return Result.ok();
    }

    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryMapper.delete(id);
        return Result.ok();
    }

    private void requireProduct(Long id) {
        if (productMapper.findById(id) == null) throw new BizException("商品不存在");
    }
}
