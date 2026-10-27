package com.campus.market.mapper;

import com.campus.market.entity.Review;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ReviewMapper {

    @Insert("INSERT INTO review(order_id,reviewer_id,target_id,rating,content,created_at) " +
            "VALUES(#{orderId},#{reviewerId},#{targetId},#{rating},#{content},NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Review review);

    @Select("SELECT COUNT(*) FROM review WHERE order_id=#{orderId} AND reviewer_id=#{reviewerId}")
    int exists(@Param("orderId") Long orderId, @Param("reviewerId") Long reviewerId);

    @Select("SELECT r.*, u.nickname AS reviewer_name, u.avatar AS reviewer_avatar FROM review r " +
            "LEFT JOIN user u ON r.reviewer_id=u.id WHERE r.target_id=#{userId} ORDER BY r.id DESC")
    List<Review> findByTarget(Long userId);

    @Select("SELECT COALESCE(AVG(rating),0) FROM review WHERE target_id=#{userId}")
    Double avgRating(Long userId);
}
