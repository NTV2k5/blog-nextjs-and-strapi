# 🌐 Next.js & Strapi 5 Integration Guide

Dự án này là một Blog hiện đại sử dụng **Next.js 16** (App Router) kết hợp với **Strapi 5 (Headless CMS)**. Tài liệu này hướng dẫn cách kết nối, nhận và hiển thị dữ liệu từ Strapi.

---

## 🛠 1. Thiết lập Kết nối (Configuration)

### Biến môi trường (`.env.local`)
Để Next.js có thể giao tiếp với Strapi, cần cấu hình URL của Backend:
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here (tùy chọn nếu không để chế độ Public)
```

### Thư viện kết nối (`src/lib/strapi.tsx`)
Chúng ta sử dụng **Axios** để khởi tạo một instance kết nối cố định:
```typescript
export const strapi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_STRAPI_URL}/api`,
  headers: {
    Authorization: process.env.STRAPI_API_TOKEN ? `Bearer ${process.env.STRAPI_API_TOKEN}` : '',
  },
});
```

---

## 📡 2. Cách Nhận Dữ liệu (Fetching Data)

### Truy vấn cơ bản
Trong Strapi 5, dữ liệu trả về nằm trực tiếp trong thuộc tính `data`. Chúng ta sử dụng hàm `getPosts()` để lấy danh sách bài viết:
```typescript
export const getPosts = async () => {
  const response = await strapi.get('/posts?populate=*');
  return response.data.data; // Mảng chứa các bài viết
};
```

### Các khái niệm quan trọng khi gọi API:
1.  **`populate=*`**: Theo mặc định, Strapi không trả về các trường liên quan (Relationships) hoặc hình ảnh (Media). *Bắt buộc* phải thêm tham số này để lấy Image, Author, v.v.
2.  **Filters**: Sử dụng để tìm kiếm chính xác bài viết (ví dụ: tìm qua slug).
    `strapi.get('/posts?filters[slug][$eq]=ten-bai-viet&populate=*')`

---

## 🏗 3. Cấu trúc Dữ liệu Strapi 5

Dữ liệu từ Strapi 5 có cấu trúc chuẩn như sau:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc-123",
      "title": "Tên bài viết",
      "content": [...], // Mảng chứa các Blocks (Rich Text)
      "cover": { "url": "/uploads/..." }
    }
  ]
}
```

---

## 🎨 4. Truyền và Hiển thị Dữ liệu (Rendering)

### Xử lý nội dung dạng Blocks (Rich Text)
Strapi 5 trả về bài viết dưới dạng mảng các "Blocks" (JSON). Chúng ta không thể render trực tiếp bằng `{post.content}`. 
**Cách giải quyết:** Sử dụng hàm `renderBlocks` đã được xây dựng sẵn trong `lib/strapi.tsx`:

```tsx
// Trong file page.tsx
import { renderBlocks } from '@/lib/strapi';

export default function BlogPost({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div className="prose">
        {renderBlocks(post.content)}
      </div>
    </div>
  );
}
```

### Xử lý Hình ảnh
Vì Strapi trả về đường dẫn tương đối (ví dụ: `/uploads/image.png`), cần hàm trợ giúp để chuyển nó thành URL tuyệt đối:
```typescript
export const getStrapiURL = (path: string) => {
  return `${process.env.NEXT_PUBLIC_STRAPI_URL}${path}`;
};
```

---

## 🔐 5. Cấu hình trên Strapi Admin (Cần thiết)

Để Next.js có thể lấy được dữ liệu, **phải** cấu hình quyền truy cập (Permissions) trong Strapi:
1.  Vào **Settings** > **Users & Permissions Plugin** > **Roles**.
2.  Chọn **Public**.
3.  Tìm đến các Content Types (Post, Author, About...) và tích chọn các quyền:
    *   `find`: Cho phép lấy danh sách bài viết.
    *   `findOne`: Cho phép lấy chi tiết 1 bài viết.
4.  Nhấn **Save**.

---

## 🚀 6. Luồng đi của dữ liệu (Data Flow)

1.  **Strapi**: Quản lý nội dung -> Xuất bản (Publish).
2.  **Next.js (Server Side/Client Side)**: Gọi hàm trong `lib/strapi.tsx` để lấy JSON.
3.  **Components**: Nhận dữ liệu thông qua `props` và render giao diện bằng kiến trúc Glassmorphism.

---

## 🔐 7. Hệ thống Quản lý Người dùng (User Management & Auth)

Hệ thống sử dụng plugin **Users & Permissions** mặc định của Strapi để quản lý thành viên.

### 🔌 Các Endpoint API sử dụng:
-   **Đăng ký**: `POST /api/auth/local/register` (Cần: `username`, `email`, `password`).
-   **Đăng nhập**: `POST /api/auth/local` (Cần: `identifier`, `password`).
-   **Đổi mật khẩu**: `POST /api/auth/change-password` (Cần JWT trong Header).
-   **Quên mật khẩu**: `POST /api/auth/forgot-password` (Gửi mã reset qua email).
-   **Đặt lại mật khẩu**: `POST /api/auth/reset-password` (Sử dụng mã `code` từ email).

### 🏗 Kiến trúc Triển khai (Next.js Side):
1.  **AuthContext (`src/context/AuthContext.tsx`)**: 
    -   Quản lý trạng thái đăng nhập toàn cục (`user`, `jwt`).
    -   Sử dụng `js-cookie` để lưu phiên đăng nhập bền vững (7 ngày).
2.  **Auth Service (`src/lib/auth.ts`)**: Chứa các hàm logic gọi API Strapi.
3.  **Auth Guard (`src/components/auth/AuthGuard.tsx`)**: 
    -   Bảo vệ các trang Home, About, Contact.
    -   Tự động hiển thị Form Login nếu người dùng chưa xác thực.
4.  **UI/UX**: Thiết kế theo phong cách **Glassmorphism** cao cấp, sử dụng `framer-motion` cho các hiệu ứng chuyển cảnh.

### Tổng hợp luồng Test hệ thống Auth (NextJS ↔ Strapi)

| Chức năng | Luồng dữ liệu (Flow) | Kết quả mong đợi trên Strapi |
| :--- | :--- | :--- |
| **Đăng ký (Signup)** | NextJS gửi `{username, email, password}` → API `/auth/local/register` | Một bản ghi mới xuất hiện trong User Collection. Password đã được băm (hash). |
| **Đăng nhập (Login)** | NextJS gửi `{identifier, password}` → API `/auth/local` | Nhận về mã JWT và thông tin User. NextJS lưu JWT vào Cookie. |
| **Đổi mật khẩu** | NextJS gửi kèm **JWT (Header)** + `{currentPassword, password...}` → API `/auth/change-password` | Strapi kiểm tra mật khẩu cũ, nếu đúng sẽ cập nhật mật khẩu mới và trả về JWT mới. |
| **Quên mật khẩu** | NextJS gửi `{email}` → API `/auth/forgot-password` | Strapi gửi email chứa link reset (cần cấu hình Email Provider trong Strapi). |
| **Đặt lại mật khẩu** | NextJS gửi `{code, password, ...}` → API `/auth/reset-password` | Strapi kiểm tra mã `code`, nếu hợp lệ sẽ cập nhật mật khẩu mới thành công. |

---

### 📧 Cấu hình Email (Cho chức năng Quên mật khẩu)

Để gửi được email khôi phục mật khẩu, Strapi cần cấu hình **Email Provider**:

1.  **Cài đặt**: `npm install @strapi/provider-email-nodemailer --save` (trong thư mục `cms-strapi`).
2.  **Cấu hình Plugin (`config/plugins.ts`)**:
    ```typescript
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST'),
          port: env.int('SMTP_PORT'),
          auth: {
            user: env('SMTP_USERNAME'),
            pass: env('SMTP_PASSWORD'),
          },
        },
      },
    }
    ```
3.  **Môi trường (`.env`)**: Sử dụng **Mailtrap** (Email Sandbox) để test local.
    -   Chọn **Email Sandbox** trên Mailtrap.
    -   Copy `Username` và `Password` vào `.env`.
4.  **URL Reset Password**: Trong Strapi Admin -> Advanced Settings, đặt `Reset password page` thành `http://localhost:3000/reset-password`.

---

### 🚦 Quy trình Kiểm thử (Testing)

1.  **Đăng ký**: Tạo user mới -> Kiểm tra trong Strapi Admin xem user có xuất hiện không.
2.  **Đăng nhập**: Dùng tài khoản vừa tạo -> Navbar sẽ hiển thị Avatar/Username.
3.  **Quên mật khẩu**: Nhập email -> Kiểm tra hòm thư Mailtrap -> Copy mã `code` -> Truy cập `/reset-password?code=...` -> Đổi mật khẩu mới.
4.  **Phân quyền**: Thử truy cập trang Home khi đã Logout -> Hệ thống phải chặn và hiện Form Login.

---
