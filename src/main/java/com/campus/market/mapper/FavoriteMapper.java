package com.campus.market.mapper;

import com.campus.market.entity.Favorite;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FavoriteMapper {

    @Insert("INSERT INTO favorite(user_id,product_id,created_at) VALUES(#{userId},#{productId},NOW())")
    int insert(Favorite favorite);

    @Delete("DELETE FROM favorite WHERE user_id=#{userId} AND product_id=#{productId}")
    int delete(@Param("userId") Long userId, @Param("productId") Long productId);

    @Select("SELECT COUNT(*) FROM favorite WHERE user_id=#{userId} AND product_id=#{productId}")
    int exists(@Param("userId") Long userId, @Param("productId") Long productId);

    @Select("SELECT f.*, p.title, p.images, p.price, p.status FROM favorite f JOIN product p ON f.product_id=p.id " +
            "WHERE f.user_id=#{userId} ORDER BY f.id DESC")
    List<Favorite> findByUser(Long userId);
}
