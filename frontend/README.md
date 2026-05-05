# Pita Frontend

Frontend cho hệ thống authentication full-stack, tập trung vào bảo mật session bằng HttpOnly cookie, route protection và luồng đổi mật khẩu bắt buộc.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router v6
- TanStack Query
- Axios (with refresh queue interceptor)
- React Hook Form + Zod
- Vitest + React Testing Library

## Local Setup

1. Tạo file env:

```bash
cp .env.example .env
```

2. Cài dependencies:

```bash
npm install
```

3. Chạy local:

```bash
npm run dev
```

## Environment Variables

- `VITE_API_URL`: backend base URL, ví dụ `http://localhost:4000`

## Architecture Decisions & Trade-offs

- Dùng `HttpOnly` cookie cho access/refresh token để giảm rủi ro XSS token theft.
- Access token không lưu ở localStorage; frontend chỉ giữ `expiresAt` để điều khiển UI session modal.
- Axios interceptor dùng request queue để tránh gửi nhiều refresh request đồng thời khi có burst `401`.
- Redux giữ auth/user state cho route guard và hiển thị profile nhất quán trên sidebar.

## Test

```bash
npm run test
```
