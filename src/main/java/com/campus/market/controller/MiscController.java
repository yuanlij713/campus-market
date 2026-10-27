package com.campus.market.controller;

import com.campus.market.common.Result;
import com.campus.market.entity.Announcement;
import com.campus.market.entity.Category;
import com.campus.market.mapper.AnnouncementMapper;
import com.campus.market.mapper.CategoryMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MiscController {

    private final CategoryMapper categoryMapper;
    private final AnnouncementMapper announcementMapper;

    public MiscController(CategoryMapper categoryMapper, AnnouncementMapper announcementMapper) {
        this.categoryMapper = categoryMapper;
        this.announcementMapper = announcementMapper;
    }

    @GetMapping("/categories")
    public Result<List<Category>> categories() {
        return Result.ok(categoryMapper.findAll());
    }

    @GetMapping("/announcements")
    public Result<List<Announcement>> announcements() {
        return Result.ok(announcementMapper.latest(5));
    }
}
