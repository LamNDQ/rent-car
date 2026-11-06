## Car Rental – Hệ thống cho thuê xe trực tuyến

| Nội dung | Thông tin |
|---|---|
| Sinh viên thực hiện | Nguyễn Đắc Quang Lâm – 21020002 |
| Lớp | 21CSE |
| Frontend | Next.js 16 (App Router) – `http://localhost:4000` |
| Backend | NestJS 11 – `http://localhost:3000` |
| Cơ sở dữ liệu | MongoDB – `mongodb://localhost:27017/car_rental` |

---

## MỤC LỤC

1. Giới thiệu đề tài
2. Phân tích yêu cầu
3. Thiết kế hệ thống
4. Thiết kế cơ sở dữ liệu
5. Thiết kế REST API
6. Bảo mật hệ thống
7. Các tính năng nổi bật
8. Kiểm thử và đánh giá
9. Triển khai và vận hành
10. Kết quả đạt được
11. Hạn chế
12. Hướng phát triển
13. Kết luận
14. Tài liệu tham khảo
15. Phụ lục

---

# 1. GIỚI THIỆU ĐỀ TÀI

## 1.1. Bối cảnh

Các cửa hàng cho thuê xe tự lái thường quản lý lịch xe bằng sổ sách, tin nhắn hoặc bảng tính. Cách làm này dễ dẫn đến trùng lịch, tính sai giá, thất lạc thông tin khách hàng và khó theo dõi tình trạng đội xe. Với khách hàng, việc tìm xe còn trống theo ngày, biết trước tổng chi phí và đặt xe nhanh là nhu cầu thiết yếu.

Car Rental được xây dựng nhằm giải quyết bài toán đó trong một hệ thống web duy nhất: khách xem xe và đặt theo khung ngày, hệ thống kiểm tra xe còn trống, tính giá theo số ngày, áp dụng ưu đãi và lưu đơn đặt xe; quản trị viên quản lý đội xe, hình ảnh, đơn đặt và tài khoản người dùng.

## 1.2. Mục tiêu

- Xây dựng ứng dụng web hoàn chỉnh theo kiến trúc tách frontend và backend.
- Cho phép khách tìm xe theo ngày, xem xe còn trống và đặt xe trực tuyến.
- Tính giá minh bạch theo số ngày thuê, loại người dùng và mã giảm giá.
- Lưu trữ dữ liệu thật trong MongoDB, không mất khi tải lại trang.
- Cung cấp khu quản trị để quản lý xe, đơn đặt và người dùng.
- Áp dụng xác thực JWT, phân quyền theo vai trò, kiểm tra dữ liệu đầu vào và các biện pháp bảo mật cơ bản.
- Đóng gói hệ thống bằng Docker Compose để có thể chạy nhất quán trên nhiều môi trường.

## 1.3. Đối tượng người dùng

- **Khách chưa đăng nhập:** xem danh sách xe, tìm xe theo ngày, xem chi tiết xe và đăng ký/đăng nhập.
- **Người dùng thường (`normal`):** đặt xe, xem đơn của mình, xóa đơn, sử dụng mã giảm giá.
- **Người dùng VIP (`vip`):** các quyền của người dùng thường và được giảm giá tự động 10%.
- **Quản trị viên (`admin`):** quản lý xe, hình ảnh, toàn bộ đơn đặt và tài khoản người dùng.

## 1.4. Phạm vi

Dự án tập trung vào nghiệp vụ cho thuê xe theo ngày: danh mục xe, tìm xe còn trống, báo giá, đặt xe, quản lý đơn và quản trị người dùng. Các nghiệp vụ thanh toán trực tuyến, hợp đồng điện tử, bảo hiểm, giao nhận xe, thông báo email và ứng dụng di động nằm ngoài phạm vi hiện tại.

## 1.5. Điểm nổi bật

- Kiểm tra xe còn trống theo khoảng ngày bằng truy vấn giao nhau (overlap) trên MongoDB.
- Tính giá theo số ngày, tự động cộng ưu đãi VIP và mã giảm giá, giới hạn tổng giảm tối đa 100%.
- Lưu ảnh chụp thông tin xe (`brand`, `model`, ảnh) vào đơn đặt để lịch sử không thay đổi khi xe được cập nhật.
- Xem trước giá ngay khi chọn ngày và mã giảm giá, có debounce để giảm số lần gọi API.
- Tự động làm mới access token khi gặp `401`, chỉ gửi một yêu cầu refresh tại một thời điểm.
- Quản trị viên tải ảnh xe bằng kéo-thả hoặc chọn tệp; ảnh được lưu trên server và phục vụ qua `/uploads`.
---

# 2. PHÂN TÍCH YÊU CẦU

## 2.1. Yêu cầu chức năng

| Nhóm chức năng | Mô tả chính |
|---|---|
| Trang chủ | Giới thiệu hệ thống, điều hướng đến danh sách xe, đăng nhập/đăng ký |
| Danh sách xe | Hiển thị xe dạng thẻ, ảnh bìa, hãng, mẫu, năm, số ghế, màu, giá ngày, trạng thái |
| Tìm xe theo ngày | Chọn ngày bắt đầu/kết thúc; chỉ hiển thị xe còn đủ chỗ cho khoảng ngày đó |
| Chi tiết xe | Gallery nhiều ảnh, thông số, giá thuê ngày, nút đặt xe |
| Đặt xe | Chọn ngày, nhập mã giảm giá, xem trước giá, tạo đơn |
| Đơn của tôi | Danh sách đơn, ngày thuê, tổng tiền, mức giảm, trạng thái, xóa đơn |
| Đăng ký / đăng nhập | Tài khoản cục bộ bằng username/email/mật khẩu; đăng nhập Google |
| SSO Google | Tạo tài khoản từ email Google; yêu cầu chọn username nếu là tài khoản mới |
| Quản lý xe (admin) | Thêm, sửa, xóa xe; tìm theo hãng/mẫu; quản lý tồn kho và trạng thái |
| Quản lý ảnh xe (admin) | Nhập URL ảnh, kéo-thả hoặc chọn nhiều tệp, xem trước, đặt ảnh bìa |
| Quản lý đơn (admin) | Xem toàn bộ đơn, tạo đơn, sửa ngày/mã giảm giá, xóa đơn |
| Quản lý người dùng (admin) | Xem danh sách, tìm kiếm, đổi vai trò `normal`/`vip`/`admin` |
| Phân quyền giao diện | Chặn người chưa đăng nhập; chặn người không phải admin vào khu quản trị |
| Tài liệu API | Swagger UI tại `/api` |

## 2.2. Yêu cầu phi chức năng

| Tiêu chí | Yêu cầu |
|---|---|
| Hiệu năng | Truy vấn availability bằng aggregation; debounce xem trước giá 400 ms; hạn chế gọi API lặp |
| Bảo mật | Mật khẩu hash bcrypt; JWT trong cookie `HttpOnly`; CSRF double-submit; phân quyền theo role; kiểm tra dữ liệu đầu vào |
| Khả dụng | Responsive; trạng thái tải/lỗi/rỗng rõ ràng; thông báo lỗi từ backend |
| Toàn vẹn dữ liệu | Ràng buộc schema; unique email; kiểm tra ngày; kiểm tra sức chứa xe theo khoảng ngày |
| Khả năng bảo trì | Tách module theo nghiệp vụ; repository/service/controller; DTO có validation |
| Khả năng triển khai | Docker Compose cho client, API và MongoDB; biến môi trường tách khỏi mã nguồn |
| Khả năng mở rộng | Kiến trúc module của NestJS; client App Router; có thể bổ sung thanh toán, hợp đồng, thông báo |

## 2.3. Tác nhân và quyền hạn

- **Guest:** đọc danh sách xe, tìm xe còn trống, xem chi tiết, đăng ký/đăng nhập.
- **User (`normal`, `vip`):** tạo đơn, xem đơn của mình, xóa đơn của mình.
- **Admin:** toàn quyền quản lý xe, đơn đặt và người dùng.
- **Backend:** là nguồn kiểm tra quyền cuối cùng thông qua `JwtAuthGuard` và `RolesGuard`.

## 2.4. Quy tắc nghiệp vụ

### Tính số ngày và giá

- Số ngày thuê = `differenceInCalendarDays(endDate, startDate)`.
- `endDate` phải sau `startDate`; nếu bằng hoặc trước sẽ bị từ chối.
- `subtotal = basePrice × days`.
- Tỷ lệ giảm = giảm VIP (10% nếu role `vip`) + tỷ lệ mã giảm giá.
- Tỷ lệ giảm bị giới hạn tối đa 100%.
- `discountAmount = subtotal × discountPercent / 100`.
- `totalPrice = subtotal − discountAmount`.
- Giá được làm tròn 2 chữ số thập phân.

### Mã giảm giá

| Mã | Mức giảm |
|---|---|
| `WELCOME10` | 10% |
| `FLASH15` | 15% |
| `SUMMER20` | 20% |
| `VIP30` | 30% |

Mã được so khớp không phân biệt hoa/thường. Mã không tồn tại hoặc rỗng không hợp lệ sẽ trả lỗi `400`.

### Kiểm tra xe còn trống

Hai khoảng ngày được coi là giao nhau khi:

```text
booking.startDate < requested.endDate
AND booking.endDate > requested.startDate
```

Chỉ các đơn có trạng thái khác `cancelled` được tính. Nếu số đơn giao nhau đã đạt `availableStock` của xe, đơn mới bị từ chối với lỗi `409`.

Danh sách xe còn trống dùng aggregation:

```text
bookedCount          = số đơn giao nhau
dynamicAvailableStock = availableStock − bookedCount
giữ xe khi dynamicAvailableStock > 0
```

### Ảnh chụp dữ liệu trong đơn

Khi tạo đơn, hệ thống lưu lại `carBrand`, `carModel`, `carImg` và `userRole`. Nhờ đó:

- Đổi tên hoặc ảnh xe sau này không làm sai lịch sử đơn.
- Ưu đãi VIP được giữ ổn định khi cập nhật đơn, kể cả khi vai trò người dùng thay đổi.

### Trạng thái đơn

- Enum hỗ trợ `pending`, `confirmed`, `cancelled`.
- Đơn mới được tạo với trạng thái `confirmed`.
- API hiện tại xóa cứng đơn khi người dùng bấm xóa; chưa có luồng chuyển trạng thái sang `cancelled` trên giao diện.
- Đơn `cancelled` (nếu có) không được tính vào kiểm tra trùng lịch.

---

# 3. THIẾT KẾ HỆ THỐNG

## 3.1. Kiến trúc tổng thể

Hệ thống gồm ba thành phần chính, chạy độc lập và giao tiếp qua HTTP.

```text
Trình duyệt
  │  Next.js :4000 (React 19, App Router)
  │  Fetch + credentials: include
  ▼
NestJS API :3000
  ├─ /users        xác thực, tài khoản, vai trò
  ├─ /cars         danh mục xe, tìm xe trống, upload ảnh
  ├─ /bookings     báo giá, đặt xe, quản lý đơn
  ├─ /sso          đăng nhập Google
  ├─ /uploads      ảnh xe tĩnh
  └─ /api          Swagger UI
  │  Mongoose
  ▼
MongoDB :27017 / car_rental
```

**Lý do lựa chọn kiến trúc:**

- Tách frontend/backend giúp mỗi phần được xây dựng, kiểm thử và triển khai độc lập.
- Next.js App Router phù hợp với giao diện nhiều trang, hỗ trợ server component cho trang danh sách.
- NestJS cung cấp module, dependency injection, guard, pipe và interceptor rõ ràng cho nghiệp vụ.
- MongoDB phù hợp với dữ liệu dạng tài liệu: xe có mảng ảnh, đơn đặt có ảnh chụp thông tin xe.
- Docker Compose giúp chạy đồng thời client, API và database bằng một lệnh.

## 3.2. Các luồng hoạt động chính

### Luồng đăng nhập và làm mới token

1. Client gọi `GET /csrf` để nhận CSRF token và cookie tương ứng.
2. Người dùng gửi `POST /users/login` kèm header `X-CSRF-Token`.
3. Backend so khớp mật khẩu bằng bcrypt, tạo `sessionId`, lưu vào danh sách phiên hợp lệ của người dùng, rồi ký JWT access token (10 phút) và refresh token (7 ngày).
4. Hai token được đặt trong cookie `HttpOnly`, `SameSite=Lax`; bật `Secure` khi production.
5. Client lưu hồ sơ người dùng (không lưu token) và hiển thị giao diện theo vai trò.
6. Khi API trả `401`, `apiClient` gọi `POST /users/refresh` đúng một lần; backend xoay vòng refresh token và `sessionId`, sau đó client thử lại yêu cầu ban đầu.
7. Đăng xuất gọi `POST /users/logout` để thu hồi phiên hiện tại và xóa cookie.

### Luồng tìm xe theo ngày

1. Người dùng chọn ngày bắt đầu và kết thúc trên trang `/user/car`.
2. Ngày được đưa lên URL để giữ trạng thái khi tải lại.
3. Client gọi `GET /cars/available?startDate=...&endDate=...`.
4. Backend kiểm tra thứ tự ngày, chạy aggregation lọc xe `isAvailable=true`, trừ số đơn giao nhau và chỉ giữ xe còn chỗ.
5. Kết quả hiển thị dưới dạng lưới thẻ xe.

### Luồng đặt xe

1. Người dùng mở chi tiết xe và bấm “Book Now”.
2. Trang `/user/booking?carId=...` điền sẵn mã xe.
3. Khi ngày hoặc mã giảm giá thay đổi, client debounce 400 ms rồi gọi `POST /bookings/preview-price`.
4. Backend tính số ngày, ưu đãi VIP, mã giảm giá và trả về bảng giá chi tiết.
5. Người dùng bấm tạo đơn; backend kiểm tra lại xe, tính lại giá, kiểm tra sức chứa rồi lưu đơn.
6. Đơn mới xuất hiện ngay trong danh sách “My Bookings”.

### Luồng quản trị ảnh xe

1. Admin mở form thêm/sửa xe.
2. Có thể nhập URL ảnh, kéo-thả tệp hoặc chọn nhiều tệp.
3. Client gọi `POST /cars/upload` với `FormData`; `apiClient` không đặt `Content-Type` để trình duyệt tự sinh boundary.
4. Backend chỉ cho admin, kiểm tra MIME và phần mở rộng, giới hạn 5 MB, lưu vào `server/uploads/cars` với tên UUID.
5. Backend trả URL tuyệt đối dựa trên `APP_BASE_URL`; client đưa URL vào mảng `imgUrl` của xe.
6. Ảnh được phục vụ tĩnh qua `/uploads/...`; ảnh đầu tiên là ảnh bìa.

### Luồng SSO Google

1. Người dùng bấm “Login with Google” và được chuyển đến `/sso/google`.
2. Google xác thực và gọi lại `/sso/google/callback`.
3. Backend tìm người dùng theo email; nếu chưa có thì tạo tài khoản với `needsProfileSetup=true`.
4. Backend ký JWT và chuyển hướng về `/login/sso-success?token=...`.
5. Client gọi `/users/me` bằng token, lưu hồ sơ; nếu cần thiết lập hồ sơ thì chuyển đến `/login/sso-setup` để chọn username.

## 3.3. Thiết kế giao diện

Giao diện được thiết kế lại theo hướng **light premium**: nền sáng `slate-50`, bề mặt trắng, màu chính `slate-900`, điểm nhấn hổ phách `amber-600`, bo góc lớn và đổ bóng nhẹ. Hệ thống component dùng chung gồm Button (6 biến thể), Input, Card, Badge, Header, Footer, Container và ConfirmDialog; toàn bộ bố cục responsive bằng Tailwind CSS.

Các màn hình chính:

- **Trang chủ:** hero toàn màn hình, form tìm xe nhanh theo ngày, xe nổi bật, lợi ích và CTA.
- **Danh sách xe:** banner chọn ngày, lưới thẻ xe, trạng thái còn/hết xe, skeleton và empty state.
- **Chi tiết xe:** gallery ảnh có thumbnail, thông số, giá ngày, sticky booking card.
- **Đặt xe:** bố cục hai cột, form ngày, mã giảm giá, xem trước giá realtime, danh sách đơn của tôi và dialog xác nhận xóa.
- **Đăng nhập/đăng ký/SSO:** layout split-screen, hiện/ẩn mật khẩu, nút đăng nhập Google và màn hình hoàn tất hồ sơ.
- **Dashboard người dùng:** thông tin tài khoản, vai trò, liên kết nhanh đến xe/đơn/quản trị.
- **Khu quản trị:** sidebar responsive, dashboard thống kê doanh thu/tồn kho, bảng xe, bảng đơn, bảng người dùng và modal chỉnh sửa sáng màu.

## 3.4. Cấu trúc thư mục

```text
rent-car/
├─ client/                         Next.js frontend
│  ├─ app/
│  │  ├─ page.tsx                  Trang chủ
│  │  ├─ login/                    Đăng nhập, SSO success, SSO setup
│  │  ├─ register/                 Đăng ký
│  │  ├─ dashboard/                Trang người dùng
│  │  ├─ access-denied/            Trang từ chối truy cập
│  │  ├─ user/
│  │  │  ├─ car/                   Danh sách, chi tiết xe
│  │  │  └─ booking/               Đặt xe và đơn của tôi
│  │  └─ admin/
│  │     ├─ dashboard/             Tổng quan quản trị
│  │     ├─ car/                   Quản lý xe và ảnh
│  │     ├─ booking/               Quản lý đơn đặt
│  │     └─ users/                 Quản lý người dùng
│  ├─ components/ui/               Button, Input, Card, Badge, Dialog...
│  ├─ hooks/                       useAuth, useCar, useBooking
│  ├─ lib/api/                     apiClient, carApi, bookingApi, userApi
│  ├─ types/                       Kiểu dữ liệu dùng chung
│  └─ public/cars/                 Ảnh xe mẫu
├─ server/                         NestJS backend
│  ├─ src/
│  │  ├─ main.ts                   Bootstrap, CORS, helmet, static, Swagger
│  │  ├─ app.module.ts             Cấu hình Mongo, JWT, throttler
│  │  ├─ auth/                     JWT strategy, guard, roles decorator, CSRF controller
│  │  ├─ core/                     Repository, interceptor, middleware
│  │  ├─ modules/
│  │  │  ├─ user/                  Schema, DTO, service, controller
│  │  │  ├─ car/                   Schema, DTO, service, controller, upload
│  │  │  ├─ booking/               Schema, pricing, service, controller
│  │  │  └─ sso/                   Google OAuth
│  │  └─ shared/cache/             Scaffold Redis (chưa gắn vào app)
│  ├─ uploads/cars/                Ảnh xe do admin tải lên
│  └─ dist/                        Kết quả build
├─ docker-compose.yml              Client + API + MongoDB
└─ README.md                       Báo cáo và hướng dẫn chạy
```

## 3.5. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 16.2, React 19.2, TypeScript 5, App Router |
| Giao diện | Tailwind CSS 4, component nội bộ, Radix/shadcn-style, Lucide |
| Gọi API | Fetch, `credentials: include`, CSRF header, refresh token một lần |
| Backend | NestJS 11, TypeScript, Express platform |
| Cơ sở dữ liệu | MongoDB, Mongoose 9 |
| Xác thực | Passport JWT, `@nestjs/jwt`, bcrypt, Google OAuth 2.0 |
| Bảo vệ | Helmet, CORS có credentials, CSRF double-submit, ValidationPipe, Throttler |
| Tài liệu | Swagger UI tại `/api` |
| Tệp tải lên | Multer `FileInterceptor`, lưu đĩa cục bộ |
| Ngày và giá | `date-fns` |
| Triển khai | Docker Compose, Dockerfile nhiều tầng, Node 26 Alpine |
| Kiểm thử | Jest 30, ts-jest |

---

# 4. THIẾT KẾ CƠ SỞ DỮ LIỆU

## 4.1. Mô hình dữ liệu

| Collection | Trường chính | Ràng buộc / ghi chú |
|---|---|---|
| `users` | `username`, `password`, `email`, `googleId`, `needsProfileSetup`, `role`, `refreshSessionIds` | `email` unique; `googleId` unique sparse; role enum `normal`/`vip`/`admin`; `refreshSessionIds` là danh sách phiên refresh hợp lệ; có timestamps |
| `cars` | `brand`, `carModel`, `year`, `color`, `seat`, `basePrice`, `stock`, `availableStock`, `isAvailable`, `imgUrl[]` | `seat ≥ 1`; giá và tồn kho `≥ 0`; `isAvailable` mặc định `true`; có optimistic concurrency |
| `bookings` | `userId`, `carId`, `userRole`, `carBrand`, `carModel`, `carImg`, `startDate`, `endDate`, `dailyPrice`, `subtotal`, `discountApplied`, `discountAmount`, `totalPrice`, `status`, `voucherCode` | `userId`/`carId` tham chiếu; status enum; lưu ảnh chụp thông tin xe; có timestamps |

## 4.2. Quan hệ dữ liệu

```text
users 1 ───── n bookings n ───── 1 cars
```

- Một người dùng có nhiều đơn đặt.
- Một xe có nhiều đơn đặt ở các khoảng ngày khác nhau.
- Mỗi đơn thuộc đúng một người dùng và một xe.
- Thông tin xe trong đơn được sao chép tại thời điểm đặt để bảo toàn lịch sử.

## 4.3. Quy ước dữ liệu

- `startDate`, `endDate` lưu dạng `Date`; client gửi chuỗi ISO từ input `type="date"`.
- Số ngày dùng `differenceInCalendarDays` để tránh lệch do giờ/phút.
- Giá là số thực, làm tròn 2 chữ số thập phân.
- `imgUrl` là mảng chuỗi; phần tử đầu tiên được dùng làm ảnh bìa.
- `activeBookings` không lưu trong database mà được tính động bằng aggregation.
- `availableStock` là sức chứa theo khoảng ngày; không bị trừ vĩnh viễn khi tạo đơn.
- Xóa đơn hiện tại là xóa cứng, không lưu lịch sử.

## 4.4. Chỉ mục

| Collection | Chỉ mục | Mục đích |
|---|---|---|
| `users` | `email` unique | Chống trùng tài khoản |
| `users` | `googleId` unique sparse | Liên kết tài khoản Google |
| `cars` | `{ brand, carModel }` | Hỗ trợ tìm theo hãng/mẫu |
| `bookings` | `userId` | Lấy đơn của người dùng |
| `bookings` | `carId` | Kiểm tra đơn theo xe |
| `bookings` | `{ carId, startDate, endDate }` | Hỗ trợ truy vấn giao nhau |

## 4.5. Công thức tính giá

```text
days            = endDate − startDate (theo lịch)
subtotal        = basePrice × days
discountPercent = (role == vip ? 10 : 0) + voucherPercent
discountPercent = min(discountPercent, 100)
discountAmount  = round(subtotal × discountPercent / 100, 2)
totalPrice      = round(subtotal − discountAmount, 2)
```

Ví dụ: xe 100 USD/ngày, thuê 9 ngày, người dùng VIP, mã `SUMMER20`:

```text
subtotal        = 900
discountPercent = 10 + 20 = 30%
discountAmount  = 270
totalPrice      = 630
```

---

# 5. THIẾT KẾ REST API

## 5.1. Nguyên tắc chung

- API JSON, frontend gọi trực tiếp qua `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:3000`).
- CORS chỉ cho phép origin cấu hình bởi `CLIENT_URL`/`FRONTEND_URL`, mặc định `http://localhost:4000`.
- Yêu cầu xác thực dùng JWT từ cookie `accessToken` hoặc header `Authorization: Bearer`.
- Mọi request thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) phải gửi header `X-CSRF-Token` khớp với cookie `csrfToken`; lấy token qua `GET /csrf`.
- `ValidationPipe` toàn cục bật `whitelist`, `forbidNonWhitelisted` và `transform`.
- Một số API booking bọc kết quả trong `{ success, statusCode, data, timestamp }`; `apiClient` tự bóc `data` nếu có.
- Lỗi trả về theo định dạng mặc định của NestJS, gồm `statusCode`, `message`, `error`.

## 5.2. Nhóm API người dùng và xác thực

| Method | Route | Quyền | Nội dung |
|---|---|---|---|
| GET | `/` | Public | Kiểm tra server hoạt động |
| GET | `/csrf` | Public | Cấp CSRF token qua JSON và cookie `csrfToken` |
| POST | `/users` | Public + CSRF | Đăng ký tài khoản; backend luôn gán role `normal` |
| POST | `/users/login` | Public + CSRF | Đăng nhập, tạo phiên và đặt cookie access/refresh token |
| POST | `/users/refresh` | Public + CSRF (cần refresh cookie) | Xoay vòng refresh token và cấp lại access token |
| POST | `/users/logout` | Public + CSRF | Thu hồi phiên hiện tại và xóa cookie đăng nhập |
| GET | `/users/me` | Đã đăng nhập | Hồ sơ người dùng hiện tại |
| GET | `/users` | Admin | Danh sách người dùng |
| GET | `/users/search?filter=...` | Public | Tìm người dùng theo username |
| GET | `/users/:id` | Đã đăng nhập | Xem người dùng theo id |
| PUT | `/users/:id` | Chủ tài khoản hoặc admin + CSRF | Tự sửa hồ sơ; chỉ admin được đổi `role` |
| DELETE | `/users/:id` | Admin + CSRF | Xóa người dùng |
| GET | `/sso/google` | Public | Bắt đầu đăng nhập Google |
| GET | `/sso/google/callback` | Public | Nhận callback, đặt cookie phiên và chuyển hướng về client |

## 5.3. Nhóm API xe

| Method | Route | Quyền | Nội dung |
|---|---|---|---|
| GET | `/cars` | Public | Danh sách toàn bộ xe |
| GET | `/cars/search` | Public | Tìm xe theo thuộc tính |
| GET | `/cars/available?startDate&endDate` | Public | Danh sách xe còn trống theo khoảng ngày |
| GET | `/cars/:id` | Public | Chi tiết xe |
| POST | `/cars/upload` | Admin | Tải ảnh xe lên server |
| POST | `/cars` | Admin | Tạo xe |
| PUT | `/cars/:id` | Admin | Cập nhật xe |
| DELETE | `/cars/:id` | Admin | Xóa xe, trả `204` |

**Ràng buộc upload ảnh:**

- Chỉ admin.
- Tối đa 5 MB mỗi tệp.
- Chỉ nhận `jpg`, `jpeg`, `png`, `webp`, `gif`, `avif`.
- Kiểm tra cả MIME (`image/*`) và phần mở rộng.
- Tên tệp gồm timestamp + UUID để tránh trùng.
- Trả URL tuyệt đối dựa trên `APP_BASE_URL`.

## 5.4. Nhóm API đặt xe

Toàn bộ controller `/bookings` yêu cầu đăng nhập.

| Method | Route | Quyền | Nội dung |
|---|---|---|---|
| GET | `/bookings` | Admin | Toàn bộ đơn đặt |
| POST | `/bookings/preview-price` | Đã đăng nhập | Báo giá, không ghi database |
| POST | `/bookings` | Đã đăng nhập | Tạo đơn |
| GET | `/bookings/my` | Đã đăng nhập | Đơn của người dùng hiện tại |
| PATCH | `/bookings/:id` | Chủ đơn hoặc admin | Sửa ngày và/hoặc mã giảm giá |
| DELETE | `/bookings/:id` | Chủ đơn hoặc admin | Xóa đơn |

## 5.5. Mã trạng thái

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới |
| 204 | Xóa thành công, không có nội dung |
| 400 | Dữ liệu sai, ngày không hợp lệ, mã giảm giá sai, không có quyền sửa đơn |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không đủ vai trò |
| 404 | Không tìm thấy xe/đơn/người dùng |
| 409 | Xe đã kín lịch trong khoảng ngày |
| 429 | Vượt giới hạn 100 yêu cầu/phút |
| 500 | Lỗi nội bộ |

## 5.6. Tài liệu Swagger

Swagger được cấu hình tại `/api` với tiêu đề “Car Rental API”. Đây là công cụ hỗ trợ kiểm thử và tra cứu endpoint trong quá trình phát triển.

---

# 6. BẢO MẬT HỆ THỐNG

## 6.1. Đã triển khai

- **Hash mật khẩu:** bcrypt với 10 salt rounds; không lưu mật khẩu thô.
- **JWT:** access token 10 phút, refresh token 7 ngày; đọc được từ cookie hoặc Bearer header; payload chứa `sessionId`.
- **JWT secret bắt buộc:** server dừng khởi động nếu `JWT_SECRET` thiếu, ngắn hơn 32 ký tự hoặc còn là giá trị mặc định/fallback.
- **Cookie:** `HttpOnly`, `SameSite=Lax`, `Secure` khi production, giảm rủi ro đọc token bằng JavaScript.
- **CSRF double-submit:** `GET /csrf` cấp token qua JSON và cookie `HttpOnly`; mọi request thay đổi dữ liệu phải gửi header `X-CSRF-Token` khớp cookie. Client tự lấy lại token và thử lại một lần khi token hết hạn.
- **Xoay vòng và thu hồi refresh token:** mỗi lần đăng nhập tạo `sessionId`; refresh tạo `sessionId` mới và vô hiệu hóa token cũ. Logout thu hồi phiên hiện tại; đổi mật khẩu thu hồi toàn bộ phiên.
- **Kiểm tra phiên ở mọi request:** `JwtStrategy` đối chiếu `sessionId` với danh sách phiên còn hiệu lực và đọc role hiện tại từ database, nên token bị thu hồi hoặc role bị đổi có hiệu lực ngay.
- **Phân quyền:** `JwtAuthGuard` xác thực, `RolesGuard` kiểm tra role; API admin được bảo vệ ở backend.
- **Validation:** DTO với `class-validator`; `ValidationPipe` loại bỏ trường lạ.
- **Đăng ký an toàn:** DTO đăng ký không còn trường `role`; backend luôn gán `normal`, request gửi `role` bị từ chối.
- **Cập nhật người dùng:** `PUT /users/:id` chỉ cho phép chủ tài khoản hoặc admin; chỉ admin được đổi role. Response loại bỏ `password` và `refreshSessionIds`.
- **Helmet:** bật các header bảo mật mặc định; cấu hình `Cross-Origin-Resource-Policy: cross-origin` để client tải ảnh từ API.
- **CORS:** chỉ origin được cấu hình, có `credentials: true` và allowlist header `X-CSRF-Token`.
- **Giới hạn tải:** upload chỉ admin, giới hạn 5 MB, kiểm tra loại tệp.
- **Giới hạn tần suất:** `ThrottlerModule` toàn cục 100 yêu cầu/phút mỗi IP.
- **Kiểm tra quyền sở hữu:** khi sửa/xóa đơn, backend so sánh `userId` trừ khi người gọi là admin.
- **Kiểm tra giá ở server:** client chỉ xem trước; khi tạo đơn backend tính lại toàn bộ để tránh sửa giá từ trình duyệt.
- **Ảnh chụp dữ liệu:** đơn giữ thông tin xe và role tại thời điểm đặt, tránh thay đổi lịch sử.
- **SSO an toàn hơn:** callback đặt cookie phiên và chuyển hướng về client, không còn truyền access token qua query string.

## 6.2. Hạn chế bảo mật còn lại

- **`GET /users/search` công khai:** có thể bị dùng để dò username; nên yêu cầu đăng nhập hoặc admin.
- **Chưa có giới hạn đăng nhập riêng:** throttle 100/phút là toàn cục, chưa đủ chặt cho chống brute force.
- **Swagger công khai:** nên tắt hoặc bảo vệ ở production.
- **Thông tin người dùng lưu ở localStorage:** chỉ là hồ sơ, không chứa token, nhưng vẫn cần lưu ý khi kiểm tra quyền phía client.
- **Race condition khi đặt xe:** kiểm tra sức chứa và ghi đơn chưa nằm trong transaction/khóa nguyên tử; hai request đồng thời có thể cùng vượt qua kiểm tra. Cần transaction hoặc cập nhật nguyên tử.
- **Client không phải trình duyệt:** phải gọi `GET /csrf` trước và gửi cookie/header tương ứng cho request thay đổi dữ liệu.

---

# 7. CÁC TÍNH NĂNG NỔI BẬT

| Tính năng | Cách triển khai | Ghi chú |
|---|---|---|
| Tìm xe theo ngày | Aggregation `$lookup` đơn giao nhau, tính `dynamicAvailableStock` | Không trừ tồn kho vĩnh viễn |
| Báo giá trước khi đặt | `POST /bookings/preview-price`, tính ở server | Không ghi database |
| Ưu đãi VIP | Cộng 10% khi role là `vip` | Áp dụng cùng mã giảm giá |
| Mã giảm giá | Catalogue cố định, so khớp không phân biệt hoa/thường | Giảm tối đa 100% |
| Ảnh chụp đơn đặt | Lưu brand/model/ảnh/role tại thời điểm đặt | Bảo toàn lịch sử |
| Gallery ảnh xe | Mảng `imgUrl`, thumbnail, ảnh bìa | Ảnh đầu tiên là cover |
| Upload ảnh | Kéo-thả/chọn tệp, Multer, UUID, giới hạn 5 MB | Lưu đĩa cục bộ |
| CSRF double-submit | `GET /csrf`, cookie `HttpOnly` + header `X-CSRF-Token` | Client tự lấy lại token khi hết hạn |
| Refresh token một lần | Biến `refreshPromise` dùng chung trong `apiClient` | Tránh bão request refresh |
| Xoay vòng phiên | `sessionId` mới mỗi lần refresh; thu hồi khi logout/đổi mật khẩu | Token cũ không dùng lại được |
| SSO Google | Passport Google OAuth 2.0 | Tài khoản mới cần đặt username |
| Quản trị người dùng | Bảng, tìm kiếm, modal đổi role | Gọi `PUT /users/:id` |
| Quản trị đơn | Bảng, tạo/sửa/xóa đơn | Admin thao tác trên mọi đơn |
| Responsive | Tailwind, grid và breakpoint | Dùng được trên mobile |
| Kiểm thử | Jest unit test cho pricing, booking, car | 36 test |

---

# 8. KIỂM THỬ VÀ ĐÁNH GIÁ

## 8.1. Chiến lược kiểm thử

- **Unit test** cho service, controller, DTO và pricing.
- **Mock repository** để kiểm tra logic nghiệp vụ mà không cần MongoDB.
- **Kiểm thử thủ công** các luồng giao diện: đăng nhập, tìm xe, xem trước giá, đặt xe, quản trị.
- **Kiểm tra build/lint/typecheck** trước khi hoàn thiện.

## 8.2. Bộ kiểm thử hiện có

Tổng cộng **36 test** trong 6 tệp:

| Tệp | Số test | Nội dung |
|---|---:|---|
| `booking.service.spec.ts` | 17 | Tạo/sửa/xóa đơn, kiểm tra quyền, hết chỗ, mã giảm giá, snapshot |
| `pricing.service.spec.ts` | 11 | Số ngày, VIP, voucher, cộng dồn, giới hạn 100%, làm tròn |
| `booking.dto.spec.ts` | 3 | Validator `endDate` sau `startDate` |
| `car.controller.spec.ts` | 2 | Danh sách xe, danh sách xe còn trống |
| `car.service.spec.ts` | 2 | Lấy xe còn trống, kiểm tra ngày không hợp lệ |
| `app.controller.spec.ts` | 1 | Kiểm tra controller gốc |

## 8.3. Phạm vi đã kiểm tra

- Tính đúng số ngày và tổng tiền.
- Áp dụng đúng ưu đãi VIP và mã giảm giá.
- Từ chối mã giảm giá không hợp lệ mà không gây tác dụng phụ.
- Không cộng nhầm ưu đãi VIP khi cập nhật đơn của người dùng thường.
- Từ chối đơn khi xe đã kín lịch.
- Kiểm tra quyền sở hữu khi sửa/xóa đơn.
- Kiểm tra ngày bắt đầu phải trước ngày kết thúc.

## 8.4. Kiểm thử thủ công

- Đăng nhập tài khoản admin và người dùng thường.
- Chuyển hướng người chưa đăng nhập về `/login`.
- Chặn người không phải admin vào `/admin/*` và chuyển đến `/access-denied`.
- Tìm xe theo ngày, mở chi tiết, xem gallery.
- Xem trước giá khi đổi ngày/mã giảm giá.
- Tạo đơn và thấy đơn xuất hiện trong “My Bookings”.
- Xóa đơn và kiểm tra danh sách.
- Upload ảnh xe bằng kéo-thả và chọn tệp.
- Kiểm tra ảnh hiển thị qua Next Image.

## 8.5. Đánh giá

- Logic giá và kiểm tra trùng lịch được tách riêng, dễ kiểm thử.
- Unit test bao phủ tốt phần pricing và booking service.
- Chưa có integration test với MongoDB thật và chưa có E2E test tự động cho trình duyệt.
- Một số lỗi bảo mật ở tầng người dùng chưa được kiểm thử tự động.
- Cần bổ sung test cho upload, SSO, refresh token và phân quyền ở controller.

---

# 9. TRIỂN KHAI VÀ VẬN HÀNH

## 9.1. Chạy frontend

```bash
cd client
npm install
npm run dev
```

Frontend chạy tại `http://localhost:4000`.

## 9.2. Chạy backend

```bash
cd server
npm install
npm run start:dev
```

Backend chạy tại `http://localhost:3000`; Swagger tại `http://localhost:3000/api`.

Có thể dùng `npm run start` nếu không cần watch. Build production bằng `npm run build`, chạy bằng `npm run start:prod`.

## 9.3. Cấu hình môi trường

Tạo `server/.env`:

```dotenv
PORT=3000
MONGO_URL=mongodb://localhost:27017/car_rental
APP_BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:4000
JWT_SECRET=thay_bang_chuoi_ngau_nhien_manh
```

`JWT_SECRET` bắt buộc phải có ít nhất 32 ký tự và không được dùng giá trị mặc định/fallback; server sẽ dừng khởi động nếu cấu hình không hợp lệ. Có thể tạo secret bằng:

```bash
openssl rand -hex 32
```

Sau khi đổi `JWT_SECRET`, mọi token cũ sẽ không còn hợp lệ. Nếu dùng Google SSO, bổ sung:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/sso/google/callback
```

Client dùng biến:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 9.4. MongoDB

- Cần MongoDB Server đang chạy tại `127.0.0.1:27017`.
- Database mặc định: `car_rental`.
- Có thể kiểm tra bằng MongoDB Compass hoặc `mongosh`.
- Dữ liệu mẫu gồm 8 xe với ảnh trong `client/public/cars/car-1.jpg` … `car-8.jpg`.

---

# 10. KẾT QUẢ ĐẠT ĐƯỢC

## 10.1. Kết quả theo mục tiêu

| Mục tiêu | Kết quả |
|---|---|
| Xem danh mục xe | Hoàn thành: lưới xe, ảnh, thông số, giá, trạng thái |
| Tìm xe theo ngày | Hoàn thành: lọc xe còn trống bằng aggregation |
| Xem chi tiết xe | Hoàn thành: gallery, thông số, nút đặt |
| Báo giá | Hoàn thành: số ngày, subtotal, giảm giá, tổng tiền |
| Đặt xe | Hoàn thành: kiểm tra sức chứa, lưu đơn, chống trùng lịch |
| Quản lý đơn | Hoàn thành: xem, tạo, sửa, xóa; admin xem toàn bộ |
| Quản lý xe | Hoàn thành: CRUD, tìm kiếm, trạng thái, tồn kho |
| Quản lý ảnh | Hoàn thành: URL, kéo-thả, nhiều ảnh, ảnh bìa |
| Xác thực | Hoàn thành: đăng ký an toàn, đăng nhập, CSRF, refresh xoay vòng, logout thu hồi phiên, Google SSO |
| Phân quyền | Hoàn thành: guard backend, kiểm tra chủ sở hữu khi cập nhật người dùng, chặn route frontend |
| Quản lý người dùng | Hoàn thành: danh sách, tìm kiếm, đổi role |
| Tài liệu API | Hoàn thành: Swagger tại `/api` |
| Kiểm thử | Hoàn thành: 36 unit test |

## 10.2. Điểm mạnh

- Nghiệp vụ cốt lõi của cho thuê xe được bao phủ từ tìm xe đến đặt và quản trị.
- Giá được tính ở server, không tin tưởng dữ liệu giá từ client.
- Kiểm tra trùng lịch dựa trên khoảng ngày giao nhau, đúng bản chất nghiệp vụ.
- Lưu ảnh chụp thông tin xe trong đơn giúp dữ liệu lịch sử ổn định.
- Kiến trúc NestJS rõ ràng, dễ mở rộng thêm module.
- Client có cơ chế refresh token một lần, tránh gọi refresh đồng loạt.
- Giao diện quản trị có các thao tác CRUD thực tế, không chỉ mock.
---

# 11. HẠN CHẾ

## 11.1. Nghiệp vụ

- Chưa có thanh toán trực tuyến, đặt cọc, hoàn tiền hoặc hóa đơn.
- Chưa có hợp đồng thuê xe, bảo hiểm, phụ phí, giới hạn km.
- Chưa có giao nhận xe, lịch bảo dưỡng hoặc theo dõi trạng thái xe theo thời gian.
- Chưa có thông báo email/SMS khi đặt hoặc hủy.
- Chưa có luồng hủy đơn thực sự; thao tác “Delete” xóa cứng bản ghi.
- Admin tạo đơn sẽ gán đơn cho chính tài khoản admin, chưa chọn được khách hàng.
- Chưa có phân trang cho danh sách xe, đơn và người dùng.

## 11.2. Kỹ thuật và bảo mật

- Đã xử lý các lỗi bảo mật ưu tiên: role từ client, thiếu kiểm tra sở hữu ở `PUT /users/:id`, lộ hash mật khẩu, thiếu CSRF, JWT fallback, refresh token chưa xoay vòng/thu hồi, SSO lộ token qua query string.
- Các hạn chế còn lại: `GET /users/search` công khai, chưa có rate limit riêng cho đăng nhập, Swagger công khai.
- Kiểm tra sức chứa và ghi đơn chưa nguyên tử, có nguy cơ race condition.
- Chưa có integration/E2E test; test hiện tại dùng mock repository.
- Dashboard admin đã có thống kê doanh thu, đơn đặt, tồn kho và người dùng nhưng chưa có biểu đồ theo thời gian.
- Sidebar admin chỉ có liên kết về storefront; thao tác đăng xuất nằm ở header người dùng.
- Chat mới có type ở client, chưa có schema/API/socket ở backend.
- Redis cache có scaffold nhưng chưa dùng trong luồng nghiệp vụ.
- Ảnh upload lưu đĩa cục bộ, chưa có volume Docker, chưa nén và chưa quét nội dung ảnh.
- Chưa có logging tập trung, audit log hoặc giám sát vận hành.
- Metadata Next.js đã được cập nhật; nội dung giao diện dùng tiếng Anh.
- Một số dependency UI (MUI, Radix) được cài nhưng chưa dùng nhất quán.
- `GET /users/search` và Swagger đang công khai.
- Dockerfile dùng `node:26-alpine`, cần kiểm tra tương thích với môi trường triển khai thực tế.

## 11.3. Dữ liệu và giao diện

- Danh mục xe mẫu chỉ có 8 xe; chưa có dữ liệu lớn để kiểm tra hiệu năng.
- Ảnh mẫu được lưu cục bộ, chưa có quy trình quản lý nguồn ảnh.
- Form đặt xe yêu cầu nhập `carId` thủ công nếu mở trực tiếp, chưa có bộ chọn xe trong trang đặt.
- Chưa có trang hồ sơ cá nhân/đổi mật khẩu.
- Chưa có thông báo toast thống nhất; các thao tác xóa đã dùng `ConfirmDialog` nhưng phản hồi thành công vẫn nằm trong từng màn hình.

---

# 12. HƯỚNG PHÁT TRIỂN

1. **Siết bảo mật nâng cao:** thêm rate limit riêng cho đăng nhập, bảo vệ `GET /users/search`, tắt Swagger ở production, bổ sung audit log và quét nội dung ảnh tải lên.
2. **Giao dịch nguyên tử:** dùng transaction hoặc cập nhật nguyên tử khi kiểm tra sức chứa và tạo đơn để chống race condition.
3. **Thanh toán và hợp đồng:** tích hợp cổng thanh toán, đặt cọc, hóa đơn, hợp đồng điện tử.
4. **Quản lý vận hành:** lịch bảo dưỡng, trạng thái xe, giao nhận, phụ phí, bảo hiểm.
5. **Thông báo:** email/SMS khi đặt, xác nhận, hủy, nhắc lịch.
6. **Dashboard:** thống kê doanh thu, đơn theo trạng thái, xe được thuê nhiều, biểu đồ theo thời gian.
7. **Tìm kiếm nâng cao:** lọc theo hãng, số ghế, khoảng giá, loại xe, địa điểm; phân trang.
8. **Ảnh và tệp:** lưu trữ đám mây, nén ảnh, CDN, kiểm tra nội dung.
9. **Kiểm thử:** integration test với MongoDB, E2E bằng Playwright/Cypress, test upload/SSO/refresh.
10. **Vận hành:** CI/CD, logging tập trung, health check, giám sát, backup MongoDB.
11. **Trải nghiệm:** đa ngôn ngữ, toast thống nhất, trang hồ sơ, chọn xe trực quan, nút đăng xuất đúng nghĩa.
12. **Chat/tư vấn:** hoàn thiện module chat nếu muốn hỗ trợ khách hàng trực tuyến.

---

# 13. KẾT LUẬN

Car Rental là một ứng dụng web hoàn chỉnh cho nghiệp vụ cho thuê xe theo ngày. Hệ thống đã hiện thực hóa các luồng chính: xem xe, tìm xe còn trống theo khoảng ngày, xem chi tiết, báo giá, đặt xe, quản lý đơn và quản trị đội xe/người dùng.

Về kỹ thuật, dự án vận dụng được các kiến thức cốt lõi của Advanced Web Design: xây dựng REST API với NestJS, thiết kế schema MongoDB, xác thực JWT, phân quyền theo vai trò, kiểm tra dữ liệu đầu vào, xử lý tải tệp, kiểm thử đơn vị và đóng gói Docker. Cách tách frontend Next.js và backend NestJS giúp hệ thống rõ ràng, dễ bảo trì và có thể mở rộng.

Các hạn chế còn lại chủ yếu nằm ở bảo mật nâng cao, thanh toán, thông báo và kiểm thử tích hợp. Với nền tảng hiện có, hệ thống có thể tiếp tục phát triển thành một sản phẩm cho thuê xe thực tế mà không cần thay đổi kiến trúc cốt lõi.

---

# 14. PHỤ LỤC

## Phụ lục A – Biến môi trường

| Biến | Nơi dùng | Ý nghĩa |
|---|---|---|
| `PORT` | Server | Cổng API, mặc định 3000 |
| `MONGO_URL` | Server | Chuỗi kết nối MongoDB |
| `APP_BASE_URL` | Server | Base URL để tạo URL ảnh upload |
| `CLIENT_URL` | Server | Origin frontend cho CORS |
| `FRONTEND_URL` | Server | Dự phòng cho CORS |
| `JWT_SECRET` | Server | Secret ký JWT |
| `GOOGLE_CLIENT_ID` | Server | Client ID Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Server | Client Secret Google OAuth |
| `GOOGLE_CALLBACK_URL` | Server | Callback URL Google OAuth |
| `NEXT_PUBLIC_API_URL` | Client | Base URL gọi API |

## Phụ lục B – Lệnh thường dùng

```bash
# Frontend
cd client
npm run dev          # chạy dev tại cổng 4000
npm run build        # build production
npm run lint         # kiểm tra ESLint

# Backend
cd server
npm run start:dev    # chạy watch
npm run build        # build NestJS
npm run test         # chạy unit test
npm run test:cov     # đo coverage
npm run lint         # ESLint + fix

# Toàn hệ thống
docker compose up --build
docker compose down
```

## Phụ lục C – Checklist demo

1. Mở `http://localhost:4000`, vào danh sách xe.
2. Chọn ngày bắt đầu/kết thúc, quan sát danh sách xe còn trống.
3. Mở chi tiết một xe, xem gallery nhiều ảnh.
4. Bấm “Book Now”, chọn ngày và mã `SUMMER20`.
5. Quan sát bảng xem trước giá: subtotal, giảm giá, tổng tiền.
6. Tạo đơn và kiểm tra đơn xuất hiện trong “My Bookings”.
7. Đăng nhập admin, vào `/admin/car`, thêm xe và upload ảnh bằng kéo-thả.
8. Vào `/admin/booking`, xem toàn bộ đơn và sửa ngày một đơn.
9. Vào `/admin/users`, tìm người dùng và đổi role.
10. Đăng xuất, kiểm tra không thể vào `/user/booking` khi chưa đăng nhập.
