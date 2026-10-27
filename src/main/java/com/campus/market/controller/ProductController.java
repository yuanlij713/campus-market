package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.config.AuthInterceptor;
import com.campus.market.entity.Product;
import com.campus.market.mapper.CategoryMapper;
import com.campus.market.mapper.ProductMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    public ProductController(ProductMapper productMapper, CategoryMapper categoryMapper) {
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
    }

    @GetMapping("/products")
    public Result<Map<String, Object>> list(@RequestParam(required = false) Long categoryId,
                                            @RequestParam(required = false) String campus,
                                            @RequestParam(required = false) String keyword,
                                            @RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "12") int size) {
        size = Math.min(Math.max(size, 1), 50);
        int offset = (Math.max(page, 1) - 1) * size;
        List<Product> list = productMapper.page(1, categoryId, campus, null, keyword, offset, size);
        long total = productMapper.count(1, categoryId, campus, null, keyword);
        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);
        return Result.ok(data);
    }

    @GetMapping("/products/{id}")
    public Result<Product> detail(@PathVariable Long id) {
        Product p = productMapper.findById(id);
        if (p == null) throw new BizException("商品不存在");
        productMapper.incrViews(id);
        p.setViews(p.getViews() + 1);
        return Result.ok(p);
    }

    @GetMapping("/products/mine")
    public Result<List<Product>> mine(HttpServletRequest request) {
        Long uid = requireUid(request);
        return Result.ok(productMapper.page(null, null, null, uid, null, 0, 200));
    }

    @PostMapping("/products")
    public Result<Product> create(HttpServletRequest request, @RequestBody Product req) {
        Long uid = requireUid(request);
        validate(req);
        req.setId(null);
        req.setUserId(uid);
        req.setStatus(0); // 待审核
        productMapper.insert(req);
        return Result.ok(productMapper.findById(req.getId()));
    }

    @PutMapping("/products/{id}")
    public Result<Void> update(HttpServletRequest request, @PathVariable Long id, @RequestBody Product req) {
        Long uid = requireUid(request);
        Product old = productMapper.findById(id);
        if (old == null || !old.getUserId().equals(uid)) throw new BizException("商品不存在或无权限");
        validate(req);
        req.setId(id);
        productMapper.update(req);
        // 修改后重新进入待审核
        productMapper.updateStatus(id, 0);
        return Result.ok();
    }

    @PutMapping("/products/{id}/offshelf")
    public Result<Void> offshelf(HttpServletRequest request, @PathVariable Long id) {
        Long uid = requireUid(request);
        Product old = productMapper.findById(id);
        if (old == null || !old.getUserId().equals(uid)) throw new BizException("商品不存在或无权限");
        productMapper.updateStatus(id, 3);
        return Result.ok();
    }

    @PutMapping("/products/{id}/onshelf")
    public Result<Void> onshelf(HttpServletRequest request, @PathVariable Long id) {
        Long uid = requireUid(request);
        Product old = productMapper.findById(id);
        if (old == null || !old.getUserId().equals(uid)) throw new BizException("商品不存在或无权限");
        productMapper.updateStatus(id, 0); // 重新审核
        return Result.ok();
    }

    private void validate(Product p) {
        if (p.getTitle() == null || p.getTitle().trim().length() < 2) throw new BizException("标题至少2个字");
        if (p.getPrice() == null || p.getPrice().signum() < 0) throw new BizException("价格不合法");
        if (p.getCategoryId() == null || categoryMapper.findById(p.getCategoryId()) == null) throw new BizException("请选择分类");
        if (p.getStock() == null || p.getStock() < 1) throw new BizException("库存至少为1");
        if (p.getCampus() == null || p.getCampus().isBlank()) throw new BizException("请选择校区");
        p.setTitle(p.getTitle().trim());
        if (p.getImages() == null) p.setImages("");
    }

    static Long requireUid(HttpServletRequest request) {
        Long uid = AuthInterceptor.uid(request);
        if (uid == null) throw new BizException("请先登录");
        return uid;
    }
}
