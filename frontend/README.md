# SimpleApp Frontend

Frontend cho hệ thống xác thực người dùng, tập trung vào trải nghiệm đăng nhập an toàn với phiên làm việc dựa trên `HttpOnly Cookie`, bảo vệ route, và xử lý timeout phiên thân thiện với người dùng.

## 1) Tổng quan những gì đã thực hiện

- Xây dựng đầy đủ các màn hình auth: đăng ký, đăng nhập, xác thực email, quên mật khẩu, đổi mật khẩu.
- Tích hợp đăng nhập Google từ giao diện người dùng.
- Thiết lập route công khai và route bảo vệ bằng `ProtectedRoute`.
- Đồng bộ trạng thái xác thực qua Redux (`isAuthenticated`, `isAuthChecked`, `user`, `accessTokenExpiresAt`).
- Tích hợp gọi API với Axios + `withCredentials` để làm việc với cookie từ backend.
- Cài interceptor xử lý `401` theo hàng đợi (refresh queue) để tránh gọi refresh token trùng lặp khi nhiều request lỗi cùng lúc.
- Thiết kế cơ chế bootstrap phiên khi vào route bảo vệ: tự gọi `/users/me` để phục hồi trạng thái đăng nhập.
- Triển khai modal cảnh báo sắp hết phiên và cho phép người dùng gia hạn phiên chủ động.
- Xây dựng dashboard cơ bản sau đăng nhập (`/dashboard`, `/dashboard/me`, `/dashboard/settings`).
- Tách hooks theo từng trang để quản lý form và side effects rõ ràng, dễ bảo trì.

## 2) Công nghệ sử dụng

- **Framework**: React 19 + Vite + TypeScript
- **State**: Redux Toolkit + React Redux
- **Routing**: React Router v6
- **Server state**: TanStack Query
- **HTTP client**: Axios
- **Form & Validation**: React Hook Form + Zod
- **UI/CSS**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

## 3) Cấu trúc luồng xác thực

- Sau khi đăng nhập thành công, backend set cookie session; frontend chỉ nhận dữ liệu người dùng + thời hạn phiên (`expiresIn`).
- Frontend không lưu token nhạy cảm ở localStorage/sessionStorage.
- Khi request gặp `401`, interceptor sẽ:
  - Kiểm tra trạng thái phiên.
  - Thử gọi `/auth/refresh`.
  - Nếu đang có một request refresh chạy, các request còn lại vào queue đợi.
  - Nếu refresh thất bại, tự logout và chuyển về `/signin?reason=session-expired`.
- Ở route bảo vệ, app bootstrap bằng `/users/me` để xác nhận user hiện tại.
- Nếu tài khoản bị đánh dấu `requiresPasswordChange`, app tự chuyển hướng về trang đổi mật khẩu.

## 4) Các trang đã triển khai

- `/signup`: đăng ký tài khoản mới.
- `/signin`: đăng nhập bằng username/email + mật khẩu.
- `/verify-email`: hiển thị trạng thái xác thực email.
- `/forgot-password`: gửi yêu cầu nhận mật khẩu tạm.
- `/change-password`: đổi mật khẩu (đặc biệt cho luồng bắt buộc đổi).
- `/dashboard`: trang tổng quan sau đăng nhập.
- `/dashboard/me`: xem thông tin cá nhân.
- `/dashboard/settings`: cập nhật thông tin cơ bản.

## 5) Biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Biến cần có:

- `VITE_API_URL`: URL backend (ví dụ `http://localhost:4000/api` hoặc `http://localhost:4000`)

Frontend sẽ tự chuẩn hóa để luôn gọi API theo base URL có hậu tố `/api`.

## 6) Cài đặt và chạy local

### Bước 1: Cài dependencies

```bash
npm install
```

### Bước 2: Chạy môi trường dev

```bash
npm run dev
```

App mặc định chạy qua Vite (thường ở `http://localhost:5173`).

## 7) Scripts hữu ích

- `npm run dev`: chạy môi trường phát triển.
- `npm run build`: type-check và build production.
- `npm run preview`: xem bản build local.
- `npm run lint`: kiểm tra ESLint.
- `npm run test`: chạy test một lần.
- `npm run test:watch`: chạy test ở watch mode.

## 8) Kiểm thử

Frontend đã cấu hình:

- `Vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- môi trường `jsdom`

Chạy test:

```bash
npm run test
```

## 9) Ghi chú triển khai

- Frontend được thiết kế cho backend auth dùng cookie `HttpOnly`.
- Session timeout được xử lý theo hướng UX: cảnh báo trước khi hết hạn và cho phép gia hạn.
- Cấu trúc component/hook tách nhỏ để dễ mở rộng cho các tính năng profile, settings và dashboard tiếp theo.
