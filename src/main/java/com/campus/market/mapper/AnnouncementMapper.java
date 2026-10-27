package com.campus.market.mapper;

import com.campus.market.entity.Announcement;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AnnouncementMapper {

    @Select("SELECT * FROM announcement ORDER BY id DESC LIMIT #{limit}")
    List<Announcement> latest(int limit);

    @Select("SELECT * FROM announcement ORDER BY id DESC")
    List<Announcement> findAll();

    @Insert("INSERT INTO announcement(title,content,created_at) VALUES(#{title},#{content},NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Announcement announcement);

    @Update("UPDATE announcement SET title=#{title}, content=#{content} WHERE id=#{id}")
    int update(Announcement announcement);

    @Delete("DELETE FROM announcement WHERE id=#{id}")
    int delete(Long id);
}
