package com.campus.market.mapper;

import com.campus.market.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {

    @Insert("INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at) " +
            "VALUES(#{username},#{password},#{salt},#{nickname},#{avatar},#{studentId},#{email},#{phone},#{campus},#{role},#{status},#{verified},NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    @Select("SELECT * FROM user WHERE id=#{id}")
    User findById(Long id);

    @Select("SELECT * FROM user WHERE username=#{username}")
    User findByUsername(String username);

    @Update("UPDATE user SET nickname=#{nickname}, avatar=#{avatar}, phone=#{phone}, campus=#{campus} WHERE id=#{id}")
    int updateProfile(User user);

    @Update("UPDATE user SET password=#{password}, salt=#{salt} WHERE id=#{id}")
    int updatePassword(@Param("id") Long id, @Param("password") String password, @Param("salt") String salt);

    @Select("SELECT * FROM user WHERE student_id=#{studentId} AND email=#{email} LIMIT 1")
    User findByStudentIdAndEmail(@Param("studentId") String studentId, @Param("email") String email);

    @Update("UPDATE user SET verified=#{verified}, student_id=#{studentId}, email=#{email} WHERE id=#{id}")
    int updateVerify(@Param("id") Long id, @Param("studentId") String studentId, @Param("email") String email, @Param("verified") int verified);

    @Update("UPDATE user SET status=#{status} WHERE id=#{id}")
    int updateStatus(@Param("id") Long id, @Param("status") int status);

    @Select("<script>SELECT id,username,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at FROM user " +
            "<where>" +
            "<if test='keyword!=null and keyword!=\"\"'>AND (username LIKE CONCAT('%',#{keyword},'%') OR nickname LIKE CONCAT('%',#{keyword},'%') OR student_id LIKE CONCAT('%',#{keyword},'%'))</if>" +
            "</where> ORDER BY id DESC LIMIT #{offset},#{size}</script>")
    List<User> page(@Param("keyword") String keyword, @Param("offset") int offset, @Param("size") int size);

    @Select("<script>SELECT COUNT(*) FROM user " +
            "<where>" +
            "<if test='keyword!=null and keyword!=\"\"'>AND (username LIKE CONCAT('%',#{keyword},'%') OR nickname LIKE CONCAT('%',#{keyword},'%') OR student_id LIKE CONCAT('%',#{keyword},'%'))</if>" +
            "</where></script>")
    long count(@Param("keyword") String keyword);

    @Select("SELECT COUNT(*) FROM user")
    long totalCount();
}
