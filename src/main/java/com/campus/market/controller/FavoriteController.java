package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.Favorite;
import com.campus.market.mapper.FavoriteMapper;
import com.campus.market.mapper.ProductMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.campus.market.controller.ProductController.requireUid;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteMapper favoriteMapper;
    private final ProductMapper productMapper;

    public FavoriteController(FavoriteMapper favoriteMapper, ProductMapper productMapper) {
        this.favoriteMapper = favoriteMapper;
        this.productMapper = productMapper;
    }

    @GetMapping
    public Result<List<Favorite>> list(HttpServletRequest request) {
        return Result.ok(favoriteMapper.findByUser(requireUid(request)));
    }

    @GetMapping("/check/{productId}")
    public Result<Boolean> check(HttpServletRequest request, @PathVariable Long productId) {
        Long uid = requireUid(request);
        return Result.ok(favoriteMapper.exists(uid, productId) > 0);
    }

    @PostMapping("/{productId}")
    public Result<Map<String, Object>> toggle(HttpServletRequest request, @PathVariable Long productId) {
        Long uid = requireUid(request);
        if (productMapper.findById(productId) == null) throw new BizException("商品不存在");
        boolean favorited;
        if (favoriteMapper.exists(uid, productId) > 0) {
            favoriteMapper.delete(uid, productId);
            favorited = false;
        } else {
            Favorite f = new Favorite();
            f.setUserId(uid);
            f.setProductId(productId);
            favoriteMapper.insert(f);
            favorited = true;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("favorited", favorited);
        return Result.ok(data);
    }
}
