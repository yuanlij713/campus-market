package com.campus.market.mapper;

import com.campus.market.entity.Product;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface ProductMapper {

    @Insert("INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at) " +
            "VALUES(#{userId},#{title},#{description},#{price},#{originalPrice},#{categoryId},#{campus},#{images},#{stock},#{status},0,NOW(),NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);

    @Update("UPDATE product SET title=#{title},description=#{description},price=#{price},original_price=#{originalPrice}," +
            "category_id=#{categoryId},campus=#{campus},images=#{images},stock=#{stock},updated_at=NOW() WHERE id=#{id}")
    int update(Product product);

    @Update("UPDATE product SET status=#{status}, updated_at=NOW() WHERE id=#{id}")
    int updateStatus(@Param("id") Long id, @Param("status") int status);

    @Update("UPDATE product SET views=views+1 WHERE id=#{id}")
    int incrViews(Long id);

    @Update("UPDATE product SET stock=stock-#{delta}, updated_at=NOW() WHERE id=#{id} AND stock>=#{delta}")
    int decrStock(@Param("id") Long id, @Param("delta") int delta);

    @Select("SELECT p.*, c.name AS category_name, u.nickname AS seller_name, u.avatar AS seller_avatar, u.verified AS seller_verified " +
            "FROM product p LEFT JOIN category c ON p.category_id=c.id LEFT JOIN user u ON p.user_id=u.id WHERE p.id=#{id}")
    Product findById(Long id);

    @Select("<script>SELECT p.*, c.name AS category_name, u.nickname AS seller_name, u.avatar AS seller_avatar, u.verified AS seller_verified " +
            "FROM product p LEFT JOIN category c ON p.category_id=c.id LEFT JOIN user u ON p.user_id=u.id " +
            "<where>" +
            "<if test='status!=null'>AND p.status=#{status}</if>" +
            "<if test='categoryId!=null'>AND p.category_id=#{categoryId}</if>" +
            "<if test='campus!=null and campus!=\"\"'>AND p.campus=#{campus}</if>" +
            "<if test='userId!=null'>AND p.user_id=#{userId}</if>" +
            "<if test='keyword!=null and keyword!=\"\"'>AND (p.title LIKE CONCAT('%',#{keyword},'%') OR p.description LIKE CONCAT('%',#{keyword},'%'))</if>" +
            "</where>" +
            "ORDER BY p.id DESC LIMIT #{offset},#{size}</script>")
    List<Product> page(@Param("status") Integer status, @Param("categoryId") Long categoryId,
                       @Param("campus") String campus, @Param("userId") Long userId,
                       @Param("keyword") String keyword, @Param("offset") int offset, @Param("size") int size);

    @Select("<script>SELECT COUNT(*) FROM product p " +
            "<where>" +
            "<if test='status!=null'>AND p.status=#{status}</if>" +
            "<if test='categoryId!=null'>AND p.category_id=#{categoryId}</if>" +
            "<if test='campus!=null and campus!=\"\"'>AND p.campus=#{campus}</if>" +
            "<if test='userId!=null'>AND p.user_id=#{userId}</if>" +
            "<if test='keyword!=null and keyword!=\"\"'>AND (p.title LIKE CONCAT('%',#{keyword},'%') OR p.description LIKE CONCAT('%',#{keyword},'%'))</if>" +
            "</where></script>")
    long count(@Param("status") Integer status, @Param("categoryId") Long categoryId,
               @Param("campus") String campus, @Param("userId") Long userId, @Param("keyword") String keyword);

    @Select("SELECT COUNT(*) FROM product")
    long totalCount();

    @Select("SELECT COUNT(*) FROM product WHERE status=0")
    long pendingCount();

    @Select("SELECT c.name AS name, COUNT(p.id) AS cnt FROM category c LEFT JOIN product p ON p.category_id=c.id GROUP BY c.id, c.name ORDER BY cnt DESC")
    List<Map<String, Object>> countByCategory();

    @Select("SELECT COALESCE(campus,'未填写') AS name, COUNT(*) AS cnt FROM product GROUP BY campus ORDER BY cnt DESC")
    List<Map<String, Object>> countByCampus();
}
