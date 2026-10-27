package com.campus.market.controller;

import com.campus.market.common.BizException;
import com.campus.market.common.Result;
import com.campus.market.entity.Message;
import com.campus.market.mapper.MessageMapper;
import com.campus.market.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.campus.market.controller.ProductController.requireUid;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageMapper messageMapper;
    private final UserMapper userMapper;

    public MessageController(MessageMapper messageMapper, UserMapper userMapper) {
        this.messageMapper = messageMapper;
        this.userMapper = userMapper;
    }

    @PostMapping
    public Result<Void> send(HttpServletRequest request, @RequestBody SendReq req) {
        Long uid = requireUid(request);
        if (req.getReceiverId() == null || userMapper.findById(req.getReceiverId()) == null) {
            throw new BizException("接收用户不存在");
        }
        if (req.getReceiverId().equals(uid)) throw new BizException("不能给自己发消息");
        if (req.getContent() == null || req.getContent().isBlank()) throw new BizException("消息内容不能为空");
        if (req.getContent().length() > 500) throw new BizException("消息内容过长");
        Message m = new Message();
        m.setSenderId(uid);
        m.setReceiverId(req.getReceiverId());
        m.setProductId(req.getProductId());
        m.setContent(req.getContent().trim());
        messageMapper.insert(m);
        return Result.ok();
    }

    @GetMapping("/conversations")
    public Result<List<Map<String, Object>>> conversations(HttpServletRequest request) {
        Long uid = requireUid(request);
        List<Map<String, Object>> list = messageMapper.conversations(uid);
        List<Map<String, Object>> unread = messageMapper.unreadBySender(uid);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> conv : list) {
            // H2 DATABASE_TO_LOWER=TRUE 会把别名转成小写，MySQL 保持原样，这里统一按键名忽略大小写取值并输出驼峰键
            Object senderId = getIgnoreCase(conv, "senderId");
            Object receiverId = getIgnoreCase(conv, "receiverId");
            Object otherId = String.valueOf(senderId).equals(String.valueOf(uid)) ? receiverId : senderId;
            long cnt = unread.stream()
                    .filter(u -> String.valueOf(getIgnoreCase(u, "otherId")).equals(String.valueOf(otherId)))
                    .mapToLong(u -> ((Number) getIgnoreCase(u, "cnt")).longValue()).findFirst().orElse(0);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", getIgnoreCase(conv, "id"));
            row.put("senderId", senderId);
            row.put("receiverId", receiverId);
            row.put("productId", getIgnoreCase(conv, "productId"));
            row.put("content", getIgnoreCase(conv, "content"));
            row.put("readFlag", getIgnoreCase(conv, "readFlag"));
            row.put("createdAt", getIgnoreCase(conv, "createdAt"));
            row.put("name", getIgnoreCase(conv, "name"));
            row.put("avatar", getIgnoreCase(conv, "avatar"));
            row.put("otherId", otherId);
            row.put("unread", cnt);
            result.add(row);
        }
        return Result.ok(result);
    }

    private static Object getIgnoreCase(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v != null) return v;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (e.getKey().equalsIgnoreCase(key)) return e.getValue();
        }
        return null;
    }

    @GetMapping("/with/{userId}")
    public Result<List<Message>> dialog(HttpServletRequest request, @PathVariable Long userId) {
        Long uid = requireUid(request);
        messageMapper.markRead(uid, userId);
        return Result.ok(messageMapper.dialog(uid, userId));
    }

    @GetMapping("/unread-count")
    public Result<Integer> unreadCount(HttpServletRequest request) {
        return Result.ok(messageMapper.unreadCount(requireUid(request)));
    }
}

@Data
class SendReq {
    private Long receiverId;
    private Long productId;
    private String content;
}
