package com.campus.market.mapper;

import com.campus.market.entity.Message;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface MessageMapper {

    @Insert("INSERT INTO message(sender_id,receiver_id,product_id,content,read_flag,created_at) " +
            "VALUES(#{senderId},#{receiverId},#{productId},#{content},0,NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Message message);

    @Select("SELECT * FROM message WHERE (sender_id=#{a} AND receiver_id=#{b}) OR (sender_id=#{b} AND receiver_id=#{a}) " +
            "ORDER BY id ASC LIMIT 500")
    List<Message> dialog(@Param("a") Long a, @Param("b") Long b);

    @Select("SELECT m.id, m.sender_id AS `senderId`, m.receiver_id AS `receiverId`, m.product_id AS `productId`, " +
            "m.content, m.read_flag AS `readFlag`, m.created_at AS `createdAt`, u.nickname AS name, u.avatar AS avatar FROM message m " +
            "JOIN (SELECT CASE WHEN sender_id=#{uid} THEN receiver_id ELSE sender_id END AS other_id, MAX(id) AS max_id " +
            "      FROM message WHERE sender_id=#{uid} OR receiver_id=#{uid} GROUP BY other_id) t ON m.id=t.max_id " +
            "JOIN user u ON u.id=t.other_id ORDER BY m.id DESC")
    List<Map<String, Object>> conversations(Long uid);

    @Select("SELECT other_id AS `otherId`, COUNT(*) AS cnt FROM (" +
            "SELECT sender_id AS other_id FROM message WHERE receiver_id=#{uid} AND read_flag=0) x GROUP BY other_id")
    List<Map<String, Object>> unreadBySender(Long uid);

    @Update("UPDATE message SET read_flag=1 WHERE receiver_id=#{uid} AND sender_id=#{other} AND read_flag=0")
    int markRead(@Param("uid") Long uid, @Param("other") Long other);

    @Select("SELECT COUNT(*) FROM message WHERE receiver_id=#{uid} AND read_flag=0")
    int unreadCount(Long uid);
}
