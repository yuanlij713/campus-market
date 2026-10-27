package com.campus.market.mapper;

import com.campus.market.entity.Category;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CategoryMapper {

    @Select("SELECT * FROM category ORDER BY sort ASC, id ASC")
    List<Category> findAll();

    @Select("SELECT * FROM category WHERE id=#{id}")
    Category findById(Long id);

    @Insert("INSERT INTO category(name,parent_id,sort) VALUES(#{name},#{parentId},#{sort})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    @Update("UPDATE category SET name=#{name}, parent_id=#{parentId}, sort=#{sort} WHERE id=#{id}")
    int update(Category category);

    @Delete("DELETE FROM category WHERE id=#{id}")
    int delete(Long id);
}
