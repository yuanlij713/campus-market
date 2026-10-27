package com.campus.market.mapper;

import com.campus.market.entity.Report;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ReportMapper {

    @Insert("INSERT INTO report(reporter_id,product_id,reason,status,created_at) VALUES(#{reporterId},#{productId},#{reason},0,NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Report report);

    @Select("SELECT r.*, u.nickname AS reporter_name, p.title AS product_title FROM report r " +
            "LEFT JOIN user u ON r.reporter_id=u.id LEFT JOIN product p ON r.product_id=p.id " +
            "ORDER BY r.status ASC, r.id DESC")
    List<Report> findAll();

    @Select("SELECT r.*, u.nickname AS reporter_name, p.title AS product_title FROM report r " +
            "LEFT JOIN user u ON r.reporter_id=u.id LEFT JOIN product p ON r.product_id=p.id " +
            "WHERE r.reporter_id=#{uid} ORDER BY r.id DESC")
    List<Report> findByReporter(Long uid);

    @Update("UPDATE report SET status=1, handle_result=#{result} WHERE id=#{id}")
    int handle(@Param("id") Long id, @Param("result") String result);

    @Select("SELECT COUNT(*) FROM report WHERE status=0")
    long pendingCount();
}
