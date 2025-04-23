---- 1. Role 추가
INSERT INTO roles (id, name, created_at, modified_at)
VALUES (1, 'USER', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

---- 2. Blog 추가
--INSERT INTO blogs (id, name, view_count, created_at, modified_at)
--VALUES (1, 'test blog', 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
--
---- 3. User 추가
--INSERT INTO users (
--  id, name, email, password, oauth2, oauth2_provider,
--  refresh_token, profile_photo, role_id, blog_id,
--  created_at, modified_at
--)
--VALUES (
--  1, '테스트유저', 'test@example.com', '1234', null, null,
--  'token', null, 1, 1,
--  CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()
--);
