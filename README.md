<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Mô tả dự án

Source code frontend: <a href="https://github.com/PhanThanhTungg/Blaite-edu-fe" target="blank">github</a>

Astudy (Blaite Edu Backend) là dịch vụ backend xây dựng bằng NestJS cho hệ thống học tập chủ động, tập trung vào:

- Quản lý người dùng, lớp học, chủ đề, kiến thức
- Sinh nội dung (topic/knowledge/theory/câu hỏi) bằng Google Gemini
- Gửi câu hỏi ôn tập theo lịch, kênh Telegram Bot
- Theo dõi streak, hoạt động học tập và thống kê cơ bản
- Xuất tài liệu API qua Swagger tại đường dẫn `/api`

## Công nghệ chính

- NestJS 11, TypeScript
- Prisma 6, PostgreSQL
- Clerk (xác thực backend), `@clerk/express`
- Google Generative AI SDK (`@google/generative-ai`)
- Swagger (`@nestjs/swagger`), Class-Validator/Transformer
- Nest Schedule, Throttler, Passport/JWT (cho một số nghiệp vụ)

Swagger được khởi tạo tại `main.ts` với tiêu đề "Astudy API" và đường dẫn `/api` (có Bearer Auth, lưu trạng thái đăng nhập trong UI swagger).

## Biến môi trường bắt buộc

Được validate trong `src/shared/env/env.schema.ts` và truy xuất qua `EnvService` (thiếu biến sẽ ném lỗi):

- `NODE_ENV` = `test` | `local` | `production`
- `PORT` (0–65535)
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `GEMINI_API_KEY`
- `GEMINI_TEMPERATURE` (0–1), `GEMINI_MAX_TOKEN` (>=1)
- `TELE_BOT_TOKEN`
- `DEPLOY_URL`
- `HOUR_STOP_SEND_QUESTION` (0–23)
- `DATABASE_URL` (PostgreSQL – dùng bởi Prisma)

## Thiết lập và chạy dự án

```bash
# Cài đặt phụ thuộc
npm install

# Sinh Prisma Client
npx prisma generate

# Áp dụng migration vào cơ sở dữ liệu
npx prisma migrate deploy   # hoặc: npx prisma migrate dev (local)
```

Chạy ứng dụng:

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run build && npm run start:prod
```

Sau khi chạy, mở Swagger tại `/api`.




