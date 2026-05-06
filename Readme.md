# SimpleApp

Ứng dụng web mẫu gồm **backend API** (Node.js + Express + TypeScript) và **frontend** (React + Vite + TypeScript), tập trung vào **xác thực người dùng** an toàn: phiên `HttpOnly Cookie`, JWT access/refresh, xác thực email, quên mật khẩu, và đăng nhập Google OAuth.

## Cấu trúc repo

| Thư mục | Mô tả |
|--------|--------|
| [`backend/`](backend/) | API, PostgreSQL, RabbitMQ (email queue), Swagger tại `/api/docs` |
| [`frontend/`](frontend/) | Giao diện React: đăng ký, đăng nhập, dashboard, cài đặt |
| [`docs/`](docs/) | Hướng dẫn chạy local và ảnh màn hình |

## Chạy nhanh trên máy local

Xem hướng dẫn đầy đủ (Docker, biến môi trường, cổng dịch vụ, luồng nghiệp vụ):

**[docs/HUONG_DAN_CHAY_WEB_LOCAL.md](docs/HUONG_DAN_CHAY_WEB_LOCAL.md)**

Tóm tắt:

1. **Backend:** vào `backend/`, tạo `.env` từ `.env.example`, chạy `docker compose up -d`, rồi `npm install` và `npm run dev` (mặc định `http://localhost:4000`).
2. **Frontend:** vào `frontend/`, tạo `.env` với `VITE_API_URL=http://localhost:4000/api`, rồi `npm install` và `npm run dev` (thường `http://localhost:5173`).

## Tài khoản demo (sau khi chạy seeder)

- `admin@simpleapp.local` / `Admin@123`
- `demo@simpleapp.local` / `Demo@123`

## Tài liệu chi tiết theo phần

- [Backend — API, bảo mật, migration, test](backend/README.md)
- [Frontend — route, Redux, Axios, UI](frontend/README.md)

## Công nghệ chính

- **Backend:** Express, Sequelize, PostgreSQL, JWT, Nodemailer, RabbitMQ, Zod, Swagger, Jest.
- **Frontend:** React 19, Vite, Redux Toolkit, React Router, TanStack Query, Axios, Tailwind CSS, Vitest.

## Yêu cầu môi trường

- Node.js 20+ (khuyến nghị LTS), npm 10+
- Docker Desktop (PostgreSQL + RabbitMQ qua Compose trong `backend/`)
