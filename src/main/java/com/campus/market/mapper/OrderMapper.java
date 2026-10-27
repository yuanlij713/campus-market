package com.campus.market.mapper;

import com.campus.market.entity.Orders;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface OrderMapper {

    @Insert("INSERT INTO orders(order_no,product_id,buyer_id,seller_id,title,image,price,quantity,status,meet_location,remark,created_at,updated_at) " +
            "VALUES(#{orderNo},#{productId},#{buyerId},#{sellerId},#{title},#{image},#{price},#{quantity},#{status},#{meetLocation},#{remark},NOW(),NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Orders order);

    @Select("SELECT o.*, b.nickname AS buyer_name, s.nickname AS seller_name FROM orders o " +
            "LEFT JOIN user b ON o.buyer_id=b.id LEFT JOIN user s ON o.seller_id=s.id WHERE o.id=#{id}")
    Orders findById(Long id);

    @Select("SELECT o.*, b.nickname AS buyer_name, s.nickname AS seller_name FROM orders o " +
            "LEFT JOIN user b ON o.buyer_id=b.id LEFT JOIN user s ON o.seller_id=s.id " +
            "WHERE o.buyer_id=#{userId} ORDER BY o.id DESC")
    List<Orders> findByBuyer(Long userId);

    @Select("SELECT o.*, b.nickname AS buyer_name, s.nickname AS seller_name FROM orders o " +
            "LEFT JOIN user b ON o.buyer_id=b.id LEFT JOIN user s ON o.seller_id=s.id " +
            "WHERE o.seller_id=#{userId} ORDER BY o.id DESC")
    List<Orders> findBySeller(Long userId);

    @Update("UPDATE orders SET status=#{status}, updated_at=NOW() WHERE id=#{id} AND status=#{expectStatus}")
    int updateStatus(@Param("id") Long id, @Param("status") int status, @Param("expectStatus") int expectStatus);

    @Select("SELECT COUNT(*) FROM orders")
    long totalCount();

    @Select("SELECT COALESCE(SUM(price*quantity),0) FROM orders WHERE status=2")
    java.math.BigDecimal totalAmount();

    @Select("SELECT CAST(created_at AS DATE) AS `day`, COUNT(*) AS cnt, COALESCE(SUM(price*quantity),0) AS amount " +
            "FROM orders WHERE created_at >= #{since} " +
            "GROUP BY CAST(created_at AS DATE) ORDER BY `day`")
    List<Map<String, Object>> trend7d(@Param("since") java.time.LocalDateTime since);
}
