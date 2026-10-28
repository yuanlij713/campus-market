-- 种子数据：管理员、演示用户、分类、公告、示例商品（幂等，可重复执行）

INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at)
SELECT 'admin','1af1683a04d4ba5674846d1fe20210ea0988f64b2acd3bedd57e1a1d7aec8416','c8f3a1','平台管理员','','ADMIN001','admin@campus.edu.cn','','九站校区',1,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM user WHERE username='admin');

INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at)
SELECT 'longyihang','fec7b32d08c1a57b1ec93d26515a73d4cd816748d8cfc1eef952491840eb03a8','d9e2b4','龙艺航','/img/seed/avatar1.svg','2023010101','longyihang@campus.edu.cn','13800000001','九站校区',0,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM user WHERE username='longyihang');

INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at)
SELECT 'huanghejun','fec7b32d08c1a57b1ec93d26515a73d4cd816748d8cfc1eef952491840eb03a8','d9e2b4','黄贺俊','/img/seed/avatar2.svg','2023010102','huanghejun@campus.edu.cn','13800000002','左家校区',0,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM user WHERE username='huanghejun');

INSERT INTO user(username,password,salt,nickname,avatar,student_id,email,phone,campus,role,status,verified,created_at)
SELECT 'liangjunjia','fec7b32d08c1a57b1ec93d26515a73d4cd816748d8cfc1eef952491840eb03a8','d9e2b4','梁俊嘉','/img/seed/avatar3.svg','2023010103','liangjunjia@campus.edu.cn','13800000003','九站校区',0,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM user WHERE username='liangjunjia');

INSERT INTO category(name,parent_id,sort) SELECT '教材书籍',0,1 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='教材书籍');
INSERT INTO category(name,parent_id,sort) SELECT '数码电子',0,2 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='数码电子');
INSERT INTO category(name,parent_id,sort) SELECT '生活用品',0,3 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='生活用品');
INSERT INTO category(name,parent_id,sort) SELECT '服饰鞋包',0,4 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='服饰鞋包');
INSERT INTO category(name,parent_id,sort) SELECT '运动户外',0,5 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='运动户外');
INSERT INTO category(name,parent_id,sort) SELECT '代步工具',0,6 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='代步工具');
INSERT INTO category(name,parent_id,sort) SELECT '美妆个护',0,7 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='美妆个护');
INSERT INTO category(name,parent_id,sort) SELECT '其他闲置',0,8 WHERE NOT EXISTS (SELECT 1 FROM category WHERE name='其他闲置');

INSERT INTO announcement(title,content,created_at)
SELECT '欢迎使用校园二手交易平台','本平台面向全校师生，同校交易、线下交付、安全可信。发布商品需通过平台审核后展示。',NOW()
WHERE NOT EXISTS (SELECT 1 FROM announcement WHERE title='欢迎使用校园二手交易平台');

INSERT INTO announcement(title,content,created_at)
SELECT '交易安全提示','请尽量选择校内公共场所当面交易，验货后再确认收货。如遇违规商品或欺诈行为，请及时举报。',NOW()
WHERE NOT EXISTS (SELECT 1 FROM announcement WHERE title='交易安全提示');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 2,'高等数学（同济第七版）上下册','八成新，笔记工整，适合大一新生，附赠习题解答。',25.00,59.00,
 (SELECT id FROM category WHERE name='教材书籍' LIMIT 1),'九站校区','/img/seed/book.jpg',1,1,32,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='高等数学（同济第七版）上下册');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 3,'蓝牙耳机 九成新','音质良好，续航约6小时，附充电仓和数据线。',68.00,199.00,
 (SELECT id FROM category WHERE name='数码电子' LIMIT 1),'左家校区','/img/seed/earphone.jpg',1,1,57,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='蓝牙耳机 九成新');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 2,'宿舍折叠小桌板','床上学习神器，可折叠收纳，桌面无划痕。',15.00,45.00,
 (SELECT id FROM category WHERE name='生活用品' LIMIT 1),'九站校区','/img/seed/desk.jpg',2,1,21,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='宿舍折叠小桌板');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 4,'山地自行车 可小刀','骑行两年，变速顺畅，刹车灵敏，送车锁和打气筒。',320.00,899.00,
 (SELECT id FROM category WHERE name='代步工具' LIMIT 1),'九站校区','/img/seed/bike.jpg',1,1,88,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='山地自行车 可小刀');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 3,'篮球 斯伯丁7号球','室外场打过几次，弹性好，送气针网兜。',35.00,129.00,
 (SELECT id FROM category WHERE name='运动户外' LIMIT 1),'左家校区','/img/seed/ball.jpg',1,1,15,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='篮球 斯伯丁7号球');

INSERT INTO product(user_id,title,description,price,original_price,category_id,campus,images,stock,status,views,created_at,updated_at)
SELECT 4,'考研英语真题全套','全新未拆封，含近15年真题及解析。',40.00,88.00,
 (SELECT id FROM category WHERE name='教材书籍' LIMIT 1),'九站校区','/img/seed/book2.jpg',1,0,3,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM product WHERE title='考研英语真题全套');
