package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.Report;
import com.campus.market.mapper.ProductMapper;
import com.campus.market.mapper.ReportMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.campus.market.controller.ProductController.requireUid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportMapper reportMapper;
    private final ProductMapper productMapper;

    public ReportController(ReportMapper reportMapper, ProductMapper productMapper) {
        this.reportMapper = reportMapper;
        this.productMapper = productMapper;
    }

    @PostMapping
    public Result<Void> create(HttpServletRequest request, @RequestBody ReportReq req) {
        Long uid = requireUid(request);
        if (req.getProductId() == null || productMapper.findById(req.getProductId()) == null) {
            throw new BizException("商品不存在");
        }
        if (req.getReason() == null || req.getReason().isBlank()) throw new BizException("请填写举报原因");
        Report r = new Report();
        r.setReporterId(uid);
        r.setProductId(req.getProductId());
        r.setReason(req.getReason().trim());
        reportMapper.insert(r);
        return Result.ok();
    }

    @GetMapping("/mine")
    public Result<List<Report>> mine(HttpServletRequest request) {
        return Result.ok(reportMapper.findByReporter(requireUid(request)));
    }

    @Data
    public static class ReportReq {
        private Long productId;
        private String reason;
    }
}
