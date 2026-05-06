# SimpleApp Backend

Backend API cho hệ thống xác thực người dùng, tập trung vào bảo mật session bằng `HttpOnly Cookie`, luồng xác thực tài khoản, quên mật khẩu với mật khẩu tạm, và tích hợp đăng nhập Google OAuth.

## 1) Tổng quan những gì đã thực hiện

- Xây dựng API xác thực đầy đủ: đăng ký, kiểm tra trùng thông tin, xác thực email, đăng nhập, refresh token, đăng xuất.
- Áp dụng mô hình JWT an toàn: access token + refresh token lưu trong cookie `HttpOnly`, có cơ chế xoay vòng refresh token.
- Triển khai phát hiện refresh token bị tái sử dụng (reuse detection) để giảm rủi ro chiếm đoạt phiên.
- Hoàn thiện luồng quên mật khẩu: tạo mật khẩu tạm, ép đổi mật khẩu ở lần đăng nhập kế tiếp.
- Tích hợp Google OAuth login (`/api/auth/google`, `/api/auth/google/callback`).
- Luồng xác thực và quên mật khẩu chạy trực tiếp trong app (không phụ thuộc SMTP/queue).
- Xây dựng quản lý hồ sơ người dùng hiện tại (`GET/PATCH /api/users/me`).
- Tài liệu hóa API bằng Swagger UI tại ` /api/docs`.
- Có migration và seeder cho PostgreSQL, kèm tài khoản demo để test nhanh.
- Có bộ test cho các luồng auth quan trọng bằng Jest.

## 2) Kiến trúc và công nghệ

- **Runtime/Framework**: Node.js, Express, TypeScript
- **CSDL**: PostgreSQL + Sequelize
- **Auth/Bảo mật**: JWT, bcrypt, cookie-parser, helmet, cors, express-rate-limit
- **Validation**: Zod
- **Tài liệu API**: swagger-ui-express
- **Testing**: Jest + Supertest

## 3) Các endpoint chính

Base URL mặc định: `http://localhost:4000/api`

### Nhóm Health

- `GET /health`: kiểm tra tiến trình backend còn sống.

### Nhóm Auth

- `POST /auth/signup`: đăng ký tài khoản, trả `verificationToken`.
- `GET /auth/signup/availability`: kiểm tra email/username đã tồn tại chưa.
- `GET /auth/verify-email?token=...`: xác thực tài khoản bằng token.
- `POST /auth/login`: đăng nhập bằng email/username + password.
- `POST /auth/refresh`: làm mới phiên từ refresh cookie.
- `POST /auth/logout`: đăng xuất, xóa phiên.
- `POST /auth/forgot-password`: tạo và trả mật khẩu tạm.
- `POST /auth/change-password`: đổi mật khẩu (thường sau khi dùng mật khẩu tạm).
- `GET /auth/google`: chuyển hướng sang Google consent.
- `GET /auth/google/callback`: callback OAuth, tạo/ghép user và tạo session.

### Nhóm Users

- `GET /users/me`: lấy thông tin user hiện tại (yêu cầu đăng nhập).
- `PATCH /users/me`: cập nhật thông tin cơ bản user hiện tại.

## 4) Luồng bảo mật đã triển khai

- Token không trả thẳng cho frontend để lưu localStorage, mà set cookie `HttpOnly`.
- Refresh token được hash và lưu DB, không lưu plaintext.
- Mỗi lần refresh đều xoay vòng refresh token.
- Nếu client gửi refresh token cũ/không khớp, backend coi là dấu hiệu reuse và vô hiệu phiên đang lưu.
- Có rate limit riêng cho nhóm endpoint nhạy cảm (`auth`, `refresh`, `forgot-password`).
- Tài khoản chưa xác thực thì không cho login.
- Khi quên mật khẩu, hệ thống đặt `requiresPasswordChange = true` để bắt buộc đổi mật khẩu.

## 5) Migration, seeder và dữ liệu mẫu

- Migration hiện có: tạo bảng `users` với các cột phục vụ login thường + Google OAuth + quản lý phiên.
- Seeder hiện có: tạo/cập nhật user demo:
  - `admin@simpleapp.local` / `Admin@123`
  - `demo@simpleapp.local` / `Demo@123`

## 6) Biến môi trường

Tạo file `.env` từ `.env.example` và điền đầy đủ:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

Lưu ý: cấu hình env được validate bằng Zod, thiếu/sai kiểu sẽ fail ngay lúc khởi động.

## 7) Cài đặt và chạy local

### Bước 1: Cài dependencies

```bash
npm install
```

### Bước 2: Chuẩn bị dịch vụ ngoài (Postgres)

Trong thư mục `backend`:

```bash
docker compose up -d
```

### Bước 3: Tạo `.env`

```bash
cp .env.example .env
```

### Bước 4: Chạy backend (dev)

```bash
npm run dev
```

Khi khởi động, app sẽ:

- Kết nối database
- Chạy migration
- Chạy seeder

## 8) Scripts hữu ích

- `npm run dev`: chạy local với watch mode.
- `npm run build`: build TypeScript ra `dist`.
- `npm run start`: chạy bản build.
- `npm run db:migrate`: chạy migration thủ công.
- `npm run db:seed`: chạy seeder thủ công.
- `npm run test`: chạy test một lần.
- `npm run test:watch`: chạy test ở watch mode.
- `npm run lint`: kiểm tra lint.
- `npm run typecheck`: kiểm tra kiểu TypeScript.

## 9) Kiểm thử và tài liệu API

- Swagger UI: `http://localhost:4000/api/docs`
- Health check: `http://localhost:4000/api/health`
- Chạy test:

```bash
npm run test
```

## 10) Ghi chú triển khai

- Backend đã tối ưu cho mô hình frontend riêng biệt qua CORS + credentials.
- Luồng OAuth Google yêu cầu cấu hình đúng redirect URI giữa backend và Google Console.
