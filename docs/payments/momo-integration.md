# Hướng dẫn tích hợp ví MoMo (Java – Spring Boot)

> Tài liệu dùng cho môi trường demo/sandbox. Khi chuyển sản xuất cần thay key và endpoint tương ứng.

## 1. Chuẩn bị tài khoản & thông số

1. Đăng nhập cổng Merchant của MoMo (https://test-payment.momo.vn/).
2. Lấy các thông tin cần thiết:
   - `partnerCode`: `MOMO4MUD20240115_TEST`
   - `accessKey`: `Ekj9og2VnRfOuIys`
   - `secretKey`: `PseUbm2s8QVJEbexsh8H3Jz2qa9tDqoa`
   - `endpoint`: `https://test-payment.momo.vn/v2/gateway/api/create`
3. Đăng ký/tùy chỉnh URL:
   - `returnUrl`: trang FE dùng hiển thị kết quả (ví dụ `http://localhost:8000/pages/payment-result.html`).
   - `notifyUrl`: endpoint BE nhận callback (IPN) từ MoMo (ví dụ `http://localhost:8080/api/portal/payment/momo/ipn`).
4. Cấu hình trong `application.properties`:

```properties
# =========================
# MOMO PAYMENT CONFIGURATION
# =========================
momo.partner-code=MOMO4MUD20240115_TEST
momo.access-key=Ekj9og2VnRfOuIys
momo.secret-key=PseUbm2s8QVJEbexsh8H3Jz2qa9tDqoa
momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.ipn-url=http://localhost:8080/api/portal/payment/momo/ipn
momo.return-url=http://localhost:8000/pages/payment-result.html
```

> **Lưu ý**: Khi test với ngrok, cần cập nhật `momo.ipn-url` với URL từ ngrok.

## 2. Cấu trúc code đã implement

### 2.1. Backend Structure

```text
mathbridge-backend/
 └─ src/main/java/com/mathbridge/
     ├─ payment/
     │   ├─ dto/
     │   │   ├─ MomoCreatePaymentRequest.java      # Request từ frontend (courseId, months)
     │   │   ├─ MomoCreatePaymentResponse.java    # Response từ MoMo (payUrl, resultCode, ...)
     │   │   └─ MomoIpnRequest.java               # IPN callback từ MoMo
     │   ├─ service/
     │   │   ├─ PaymentMomo.java                  # Service chính: tạo payment, tính học phí, gọi MoMo API
     │   │   └─ PaymentMomoIpnService.java       # Service xử lý IPN callback
     │   ├─ controller/
     │   │   └─ PaymentMomoController.java        # Controller với 2 endpoints: /create và /ipn
     │   └─ utils/
     │       └─ HmacSignatureUtil.java            # Utility tạo HMAC SHA256 signature
     ├─ repository/
     │   └─ HoaDonRepository.java                 # Repository quản lý hóa đơn
     ├─ config/
     │   └─ RestTemplateConfig.java              # Bean RestTemplate cho HTTP client
     └─ security/
         └─ SecurityConfig.java                   # Cấu hình security (IPN endpoint là public)
```

### 2.2. Frontend Structure

```text
mathbridge-frontend/
 └─ assets/js/
     ├─ api/
     │   └─ courses.api.js                        # Thêm function createMomoPayment()
     └─ pages/
         └─ courses.page.js                       # Logic xử lý khi chọn MoMo payment
```

## 3. Chi tiết implementation

### 3.1. PaymentMomo Service

**File**: `mathbridge-backend/src/main/java/com/mathbridge/payment/service/PaymentMomo.java`

**Chức năng**:
- Nhận `courseId` và `months` từ request
- Tính toán học phí: `mucGiaThang * months`
- Tạo `orderId` unique (format: `HD{timestamp}{random}`)
- Tạo signature HMAC SHA256
- Gọi MoMo API để tạo payment
- Lưu `HoaDon` vào DB với status `PENDING`

**Key methods**:
```java
@Transactional
public MomoCreatePaymentResponse createPayment(MomoCreatePaymentRequest req, String studentId)
```

**Flow**:
1. Validate và lấy thông tin `LopHoc` từ DB
2. Validate `HocSinh` từ `studentId`
3. Tính `amount = mucGiaThang * months`
4. Tạo `orderId`, `requestId` (UUID)
5. Build payload với signature
6. Gọi MoMo API
7. Lưu `HoaDon` với status `PENDING`
8. Trả về `payUrl` cho frontend

### 3.2. PaymentMomoIpnService

**File**: `mathbridge-backend/src/main/java/com/mathbridge/payment/service/PaymentMomoIpnService.java`

**Chức năng**:
- Nhận IPN callback từ MoMo
- Verify signature để đảm bảo request hợp lệ
- Kiểm tra `orderId` và `amount` khớp với DB
- Cập nhật `HoaDon.trangThai`:
  - `resultCode == 0` → `PAID`
  - `resultCode != 0` → `FAILED`

**Key methods**:
```java
@Transactional
public ResponseEntity<?> handleIpn(MomoIpnRequest ipn)
```

### 3.3. PaymentMomoController

**File**: `mathbridge-backend/src/main/java/com/mathbridge/payment/controller/PaymentMomoController.java`

**Endpoints**:

1. **POST `/api/portal/payment/momo/create`** (Protected - cần JWT)
   - Request body:
     ```json
     {
       "courseId": "LH001",
       "months": 1
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "Tạo payment thành công",
       "data": {
         "payUrl": "https://test-payment.momo.vn/pay?token=...",
         "orderId": "HD12345678901234",
         "amount": 750000,
         "deeplink": "momo://..."
       }
     }
     ```

2. **POST `/api/portal/payment/momo/ipn`** (Public - không cần JWT)
   - Nhận callback từ MoMo server
   - Response cho MoMo:
     ```json
     {
       "resultCode": 0,
       "message": "Success"
     }
     ```

### 3.4. Frontend Integration

**File**: `mathbridge-frontend/assets/js/api/courses.api.js`

**Function**: `createMomoPayment(courseId, months)`
- Gọi API `/api/portal/payment/momo/create` với JWT token
- Trả về `payUrl` để redirect

**File**: `mathbridge-frontend/assets/js/pages/courses.page.js`

**Function**: `initPaymentConfirmButton()`
- Khi user chọn MoMo và click "Xác nhận thanh toán"
- Gọi `createMomoPayment()`
- Redirect đến `payUrl` nếu thành công

## 4. Hướng dẫn test chi tiết

### 4.1. Chuẩn bị môi trường

1. **Backend đang chạy**:
   ```bash
   cd mathbridge-backend
   mvn spring-boot:run
   # Hoặc chạy từ IDE
   ```
   Backend chạy tại: `http://localhost:8080`

2. **Frontend đang chạy**:
   ```bash
   cd mathbridge-frontend
   # Sử dụng Live Server hoặc bất kỳ HTTP server nào
   # Frontend chạy tại: http://localhost:8000
   ```

3. **Cài đặt ngrok** (để MoMo có thể gọi IPN callback):
   ```bash
   # Download ngrok từ https://ngrok.com/
   # Hoặc dùng chocolatey: choco install ngrok
   
   # Chạy ngrok để expose port 8080
   ngrok http 8080
   ```
   
   Ngrok sẽ tạo URL như: `https://abc123.ngrok.io`
   
4. **Cập nhật IPN URL trong application.properties**:
   ```properties
   momo.ipn-url=https://abc123.ngrok.io/api/portal/payment/momo/ipn
   ```
   
   **Lưu ý**: Cần restart backend sau khi cập nhật.

### 4.2. Test flow hoàn chỉnh

#### Bước 1: Chuẩn bị môi trường

1. **Backend đang chạy**:
   ```bash
   cd mathbridge-backend
   mvn spring-boot:run
   # Hoặc chạy từ IDE
   ```
   Backend chạy tại: `http://localhost:8080`

2. **Frontend đang chạy**:
   ```bash
   cd mathbridge-frontend
   # Sử dụng Live Server hoặc bất kỳ HTTP server nào
   # Frontend chạy tại: http://localhost:8000
   ```

3. **Cài đặt và chạy ngrok** (để MoMo có thể gọi IPN callback):
   ```bash
   # Download ngrok từ https://ngrok.com/
   # Hoặc dùng chocolatey: choco install ngrok
   
   # Chạy ngrok để expose port 8080
   ngrok http 8080
   ```
   
   Ngrok sẽ tạo URL như: `https://abc123.ngrok.io`
   
4. **Cập nhật IPN URL trong application.properties**:
   ```properties
   momo.ipn-url=https://abc123.ngrok.io/api/portal/payment/momo/ipn
   ```
   
   **Lưu ý**: Cần restart backend sau khi cập nhật.

#### Bước 2: Đăng nhập với tài khoản học sinh

1. Mở trình duyệt: `http://localhost:8000/pages/login.html`
2. Đăng nhập với tài khoản học sinh (hoặc đăng ký mới)
3. Đảm bảo có JWT token trong `localStorage` (key: `mb_auth`)
4. **Kiểm tra console**: Không có lỗi authentication

#### Bước 3: Chọn khóa học và đăng ký

1. Truy cập: `http://localhost:8000/pages/Courses.html?grade=9`
2. Click "Đăng ký ngay" trên một khóa học
3. **Nếu chưa đăng nhập**: Sẽ hiện form đăng ký/đăng nhập
4. **Nếu đã đăng nhập**: Sẽ hiện modal "Thông tin khóa học" (Form 1) ngay lập tức

#### Bước 4: Chọn số tháng thanh toán

1. Trong modal "Thông tin khóa học":
   - Xem thông tin khóa học, giáo viên, mô tả
   - Chọn số tháng thanh toán (1-3 tháng, tùy vào `soBuoi` của khóa học)
   - Xem tổng tiền dự kiến: `mucGiaThang * months`
   - **Kiểm tra**: Tất cả thông tin hiển thị trong một khung, không cần scroll
2. Click "Xác nhận"

#### Bước 5: Chọn phương thức thanh toán MoMo

1. Modal "Chọn phương thức thanh toán" (Form 2) sẽ hiện
2. Xem tóm tắt đơn hàng:
   - Khóa học
   - Số tháng
   - Tổng tiền
3. Click vào logo **MoMo** (logo sẽ được highlight)
4. Click "Xác nhận thanh toán"

#### Bước 6: Xử lý payment (Backend)

1. **Frontend sẽ**:
   - Gọi API `POST /api/portal/payment/momo/create` với JWT token
   - Payload: `{ "courseId": "LH001", "months": 1 }`
   - Console log: `[createMomoPayment] Calling API: ...`
   - Console log: `[createMomoPayment] Token: ...`

2. **Backend sẽ**:
   - Verify JWT token và extract `studentId`
   - Tính học phí: `mucGiaThang * months`
   - Tạo `ID_HoaDon` ngắn (HD###, ví dụ: HD117)
   - Tạo signature HMAC SHA256
   - Gọi MoMo API
   - Lưu `HoaDon` với status `PENDING` và `ID_HoaDon = HD117`
   - Trả về `payUrl`

3. **Kiểm tra Backend Console**:
   ```
   [PaymentMomoController] JWT claims: [sub, roles, uid, ...]
   [PaymentMomoController] idTk from claim 'uid': TK001
   [PaymentMomoController] idHsRef: HS001
   ```

4. **Kiểm tra Database**:
   ```sql
   SELECT * FROM HoaDon WHERE ID_HoaDon = 'HD117'
   ```
   - `ID_HoaDon` = HD117 (5 ký tự, không bị truncate)
   - `TrangThai` = 'PENDING'
   - `TongTien` = 750000
   - `SoThang` = '1'

#### Bước 7: Thanh toán trên MoMo

1. **Frontend redirect** đến `payUrl` (trang thanh toán MoMo)
2. **Trên trang MoMo**:
   - Xem thông tin đơn hàng:
     - Mã đơn hàng: HD117
     - Số tiền: 750.000₫
     - Mô tả: "Thanh toan khoa hoc L..."
   - Quét QR code bằng app MoMo test
   - Hoặc click "Thanh toán" nếu có tài khoản MoMo test

3. **Test Case 1: Thanh toán thành công**
   - Đăng nhập MoMo test account
   - Xác nhận thanh toán
   - MoMo sẽ gọi IPN callback

4. **Test Case 2: Hủy thanh toán**
   - Click "Hủy" hoặc đóng trang
   - MoMo sẽ gọi IPN callback với `resultCode != 0`

#### Bước 8: Xử lý callback (IPN)

1. **MoMo sẽ gọi IPN callback**:
   - URL: `https://abc123.ngrok.io/api/portal/payment/momo/ipn`
   - Method: `POST`
   - Body: JSON với thông tin giao dịch (signature, orderId, amount, resultCode, ...)

2. **Kiểm tra ngrok web interface**:
   - Mở: `http://127.0.0.1:4040`
   - Xem request từ MoMo đến `/api/portal/payment/momo/ipn`
   - Xem request body và response

3. **Backend sẽ**:
   - Verify signature
   - Kiểm tra `orderId` (HD117) và `amount` (750000) khớp với DB
   - Cập nhật `HoaDon.trangThai`:
     - `resultCode == 0` → `PAID`
     - `resultCode != 0` → `FAILED`
   - Trả về response cho MoMo: `{"resultCode": 0, "message": "Success"}`

4. **Kiểm tra Backend Console**:
   ```
   [PaymentMomoIpnService] Verifying signature...
   [PaymentMomoIpnService] Order found: HD117
   [PaymentMomoIpnService] Amount matches: 750000
   [PaymentMomoIpnService] Updating HoaDon status to PAID
   ```

5. **Kiểm tra Database sau IPN**:
   ```sql
   SELECT * FROM HoaDon WHERE ID_HoaDon = 'HD117'
   ```
   - `TrangThai` = 'PAID' (nếu thành công) hoặc 'FAILED' (nếu hủy)
   - `NgayThanhToan` được cập nhật (nếu thành công)

#### Bước 9: Redirect về returnUrl

1. **MoMo sẽ redirect user** về `returnUrl`: `http://localhost:8000/pages/payment-result.html`
2. **Lưu ý**: Trang này chưa được tạo, cần tạo để hiển thị kết quả thanh toán
3. **Tạm thời**: User sẽ thấy 404, nhưng payment đã được xử lý qua IPN callback

### 4.3. Test các trường hợp chi tiết

#### Test Case 1: Thanh toán thành công ✅

**Steps**:
1. Đăng nhập học sinh
2. Chọn khóa học → Đăng ký
3. Chọn số tháng → Xác nhận
4. Chọn MoMo → Xác nhận thanh toán
5. Trên trang MoMo, đăng nhập và thanh toán thành công

**Kiểm tra**:
- ✅ Frontend redirect đến MoMo payment page
- ✅ Console log: `[createMomoPayment] Response status: 200`
- ✅ Backend console: `[PaymentMomoController] idHsRef: HS001`
- ✅ Database: `HoaDon` được tạo với `ID_HoaDon = HD117`, `TrangThai = PENDING`
- ✅ IPN callback được gọi (check ngrok: `http://127.0.0.1:4040`)
- ✅ Database: `HoaDon.TrangThai = PAID`, `NgayThanhToan` được cập nhật
- ✅ Backend console: `[PaymentMomoIpnService] Updating HoaDon status to PAID`

**Expected Result**:
```sql
SELECT ID_HoaDon, TrangThai, TongTien, NgayThanhToan 
FROM HoaDon 
WHERE ID_HoaDon = 'HD117'
-- Result: HD117, PAID, 750000, 2025-01-XX
```

#### Test Case 2: Hủy thanh toán ❌

**Steps**:
1. Chọn MoMo → Xác nhận thanh toán
2. Trên trang MoMo, click "Hủy" hoặc đóng trang

**Kiểm tra**:
- ✅ IPN callback được gọi với `resultCode != 0` (thường là 49)
- ✅ Database: `HoaDon.TrangThai = FAILED`
- ✅ Backend console: `[PaymentMomoIpnService] Updating HoaDon status to FAILED`

**Expected Result**:
```sql
SELECT ID_HoaDon, TrangThai, NgayThanhToan 
FROM HoaDon 
WHERE ID_HoaDon = 'HD118'
-- Result: HD118, FAILED, NULL
```

#### Test Case 3: Lỗi signature (Security Test) 🔒

**Steps**:
1. Tạm thời thay đổi `momo.secret-key` trong `application.properties`
2. Restart backend
3. Thực hiện thanh toán và thanh toán thành công trên MoMo
4. MoMo gọi IPN callback

**Kiểm tra**:
- ✅ IPN callback trả về: `{"resultCode": 5, "message": "Invalid signature"}`
- ✅ Database: `HoaDon.TrangThai` vẫn là `PENDING` (không được cập nhật)
- ✅ Backend console: `[PaymentMomoIpnService] Invalid signature`

**Expected Result**: Payment không được confirm vì signature không khớp (đúng behavior)

#### Test Case 4: Không có JWT token 🔑

**Steps**:
1. Xóa `mb_auth` và `mb_token` trong `localStorage`
2. Refresh trang Courses
3. Chọn khóa học → Đăng ký
4. Chọn MoMo → Xác nhận thanh toán

**Kiểm tra**:
- ✅ Frontend hiển thị confirm dialog: "Bạn cần đăng nhập để thanh toán..."
- ✅ Nếu click OK → redirect đến trang login
- ✅ Console log: `[createMomoPayment] Token: null`
- ✅ Alert: "Bạn cần đăng nhập để thanh toán."

**Expected Result**: User được yêu cầu đăng nhập trước khi thanh toán

#### Test Case 5: Không tìm thấy khóa học 📚

**Steps**:
1. Đăng nhập học sinh
2. Mở DevTools Console
3. Gọi API trực tiếp với `courseId` không tồn tại:
   ```javascript
   fetch('http://localhost:8080/api/portal/payment/momo/create', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer YOUR_TOKEN'
     },
     body: JSON.stringify({
       courseId: 'LH999',
       months: 1
     })
   })
   ```

**Kiểm tra**:
- ✅ Backend trả về: `{"success": false, "message": "Không tìm thấy lớp học với ID: LH999"}`
- ✅ Status code: 500 (RuntimeException)

**Expected Result**: Error message rõ ràng về khóa học không tồn tại

#### Test Case 6: ID_HoaDon bị trùng (Concurrency Test) ⚡

**Steps**:
1. Tạo 2 payment requests cùng lúc (có thể dùng 2 browser tabs)
2. Cả 2 requests đều gọi `findMaxHdNumber()` cùng lúc

**Kiểm tra**:
- ✅ Database constraint sẽ báo lỗi nếu `ID_HoaDon` trùng
- ✅ Backend sẽ retry hoặc throw exception
- ✅ **Lưu ý**: Có thể cần thêm transaction lock hoặc retry logic

**Expected Result**: Một trong 2 requests sẽ fail với lỗi duplicate key (hoặc cần implement retry)

#### Test Case 7: MoMo API trả về lỗi 🌐

**Steps**:
1. Tạm thời thay đổi `momo.endpoint` thành URL sai
2. Restart backend
3. Thực hiện thanh toán

**Kiểm tra**:
- ✅ Backend console: `[PaymentMomo] Lỗi khi gọi MoMo API: ...`
- ✅ Frontend nhận error: `"Lỗi khi tạo payment: MoMo API trả về lỗi: ..."`
- ✅ Database: `HoaDon` KHÔNG được tạo (vì lỗi trước khi save)

**Expected Result**: Error được handle gracefully, không tạo `HoaDon` nếu MoMo API fail

### 4.4. Kiểm tra database

Sau khi test, kiểm tra bảng `HoaDon` trong database:

```sql
-- Xem tất cả hóa đơn mới nhất
SELECT 
    ID_HoaDon,
    ID_LH,
    ID_HS,
    SoThang,
    TongTien,
    TrangThai,
    NgayDangKy,
    NgayThanhToan
FROM HoaDon
ORDER BY NgayDangKy DESC

-- Xem hóa đơn cụ thể (thay HD117 bằng orderId thực tế)
SELECT * FROM HoaDon WHERE ID_HoaDon = 'HD117'

-- Kiểm tra ID_HoaDon không bị truncate (phải có đủ ký tự)
SELECT 
    ID_HoaDon,
    LEN(ID_HoaDon) AS Length,
    TrangThai
FROM HoaDon
WHERE ID_HoaDon LIKE 'HD%'
ORDER BY NgayDangKy DESC
```

**Kết quả mong đợi**:
- ✅ Có record với `ID_HoaDon` = `HD117` (5 ký tự, không bị truncate)
- ✅ `TrangThai` = `PENDING` (khi mới tạo) hoặc `PAID`/`FAILED` (sau IPN)
- ✅ `TongTien` = `mucGiaThang * months` (ví dụ: 750000)
- ✅ `SoThang` = số tháng đã chọn (ví dụ: '1')
- ✅ `NgayDangKy` = ngày hiện tại
- ✅ `NgayThanhToan` = NULL (nếu PENDING) hoặc ngày thanh toán (nếu PAID)

### 4.5. Debug và troubleshooting

#### Lỗi: "Không tìm thấy thông tin học sinh trong token" 🔑

**Nguyên nhân**: 
- JWT token không có claim `uid` (token cũ được tạo trước khi fix)
- `TaiKhoan` không có `idHsRef` (học sinh chưa được link với tài khoản)

**Giải pháp**:
1. **Đăng xuất và đăng nhập lại** để có token mới (có `uid`)
2. Kiểm tra JWT token có claim `uid`:
   ```javascript
   // Trong browser console
   const token = localStorage.getItem('mb_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('JWT claims:', payload);
   // Phải có: { uid: "TK001", roles: ["R001"], sub: "email@..." }
   ```
3. Kiểm tra `TaiKhoan.idHsRef` trong DB:
   ```sql
   SELECT ID_TK, Email, ID_HS_Ref FROM TaiKhoan WHERE Email = 'user@email.com'
   ```
4. Nếu `ID_HS_Ref` là NULL → học sinh chưa được link, cần update

**Debug logs**:
- Backend console: `[PaymentMomoController] Authentication is null`
- Backend console: `[PaymentMomoController] JWT claims: [...]`
- Backend console: `[PaymentMomoController] idTk from claim 'uid': null`

#### Lỗi: "String or binary data would be truncated" (ID_HoaDon) ✂️

**Nguyên nhân**: 
- `ID_HoaDon` có `length = 10` trong DB
- Code tạo orderId dài hơn 10 ký tự

**Giải pháp**:
- ✅ **Đã fix**: Sử dụng format `HD###` (5 ký tự) thay vì `HD{timestamp}{random}`
- Kiểm tra `ID_HoaDon` trong DB:
  ```sql
  SELECT ID_HoaDon, LEN(ID_HoaDon) AS Length FROM HoaDon WHERE ID_HoaDon LIKE 'HD%'
  ```
- Tất cả `ID_HoaDon` phải có `Length <= 10`

#### Lỗi: "MoMo API trả về lỗi" 🌐

**Nguyên nhân**: 
- Signature không đúng
- Endpoint không đúng
- Partner code/access key/secret key sai
- Network issue

**Giải pháp**:
1. Kiểm tra lại cấu hình trong `application.properties`:
   ```properties
   momo.partner-code=MOMO4MUD20240115_TEST
   momo.access-key=Ekj9og2VnRfOuIys
   momo.secret-key=PseUbm2s8QVJEbexsh8H3Jz2qa9tDqoa
   momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
   ```
2. Kiểm tra log backend để xem response từ MoMo:
   ```
   [PaymentMomo] MoMo API trả về lỗi: 400 Bad Request
   ```
3. Verify signature string format (check code trong `PaymentMomo.createPayment()`)
4. Test endpoint bằng Postman hoặc curl:
   ```bash
   curl -X POST https://test-payment.momo.vn/v2/gateway/api/create \
     -H "Content-Type: application/json" \
     -d '{"partnerCode":"MOMO4MUD20240115_TEST",...}'
   ```

#### Lỗi: IPN callback không được gọi 📞

**Nguyên nhân**:
- `momo.ipn-url` không accessible từ internet
- Ngrok không chạy hoặc URL đã thay đổi
- MoMo không thể reach được ngrok URL

**Giải pháp**:
1. Đảm bảo ngrok đang chạy:
   ```bash
   ngrok http 8080
   ```
2. Lấy URL mới từ ngrok (ví dụ: `https://abc123.ngrok.io`)
3. Cập nhật `momo.ipn-url` trong `application.properties`:
   ```properties
   momo.ipn-url=https://abc123.ngrok.io/api/portal/payment/momo/ipn
   ```
4. **Restart backend** (quan trọng!)
5. Kiểm tra ngrok web interface: `http://127.0.0.1:4040` để xem:
   - Request từ MoMo đến `/api/portal/payment/momo/ipn`
   - Request body và response
   - Status code (phải là 200)

**Debug**:
- Ngrok web interface sẽ hiển thị tất cả requests
- Nếu không thấy request từ MoMo → ngrok URL không đúng hoặc MoMo không thể reach

#### Lỗi: "Invalid signature" trong IPN 🔐

**Nguyên nhân**: 
- Raw signature string không khớp với format MoMo yêu cầu
- Secret key không đúng
- Thứ tự các field trong raw signature sai

**Giải pháp**:
1. Kiểm tra lại cách build raw signature string trong `PaymentMomoIpnService.handleIpn()`:
   ```java
   String rawSignature = String.format(
       "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
       ...
   );
   ```
2. Đảm bảo thứ tự các field đúng (theo MoMo documentation)
3. Kiểm tra secret key:
   ```properties
   momo.secret-key=PseUbm2s8QVJEbexsh8H3Jz2qa9tDqoa
   ```
4. Thêm logging để debug:
   ```java
   System.out.println("[PaymentMomoIpnService] Raw signature: " + rawSignature);
   System.out.println("[PaymentMomoIpnService] Expected signature: " + expectedSignature);
   System.out.println("[PaymentMomoIpnService] Received signature: " + ipn.getSignature());
   ```

#### Lỗi: "Order not found" trong IPN 📦

**Nguyên nhân**:
- `orderId` từ MoMo không khớp với `ID_HoaDon` trong DB
- `HoaDon` chưa được tạo (lỗi ở bước create payment)

**Giải pháp**:
1. Kiểm tra `orderId` từ MoMo IPN callback
2. Kiểm tra `HoaDon` trong DB:
   ```sql
   SELECT * FROM HoaDon WHERE ID_HoaDon = 'HD117'
   ```
3. Nếu không có → payment creation đã fail, cần check log backend
4. Nếu có nhưng `orderId` khác → có thể do format orderId đã thay đổi

#### Lỗi: "Amount mismatch" trong IPN 💰

**Nguyên nhân**:
- Số tiền từ MoMo không khớp với `HoaDon.TongTien` trong DB

**Giải pháp**:
1. Kiểm tra `amount` từ MoMo IPN callback
2. Kiểm tra `TongTien` trong DB:
   ```sql
   SELECT ID_HoaDon, TongTien FROM HoaDon WHERE ID_HoaDon = 'HD117'
   ```
3. So sánh: `ipn.getAmount()` vs `hoaDon.getTongTien().longValue()`
4. Nếu khác → có thể do tính toán sai hoặc MoMo đã thay đổi amount

## 5. Checklist bảo mật & production

- [x] Luôn verify `signature` từ MoMo (đã implement trong `PaymentMomoIpnService`)
- [x] Kiểm tra `orderId` và `amount` khớp với DB (đã implement)
- [ ] Sử dụng HTTPS cho `notifyUrl`/`returnUrl` (cần khi deploy production)
- [ ] Khi chuyển lên production, dùng endpoint & key live
- [ ] Bật cấu hình whitelisting IP nếu có
- [ ] Lưu lại log giao dịch (request/response, status) để hỗ trợ tra soát
- [ ] Tạo trang `payment-result.html` để hiển thị kết quả thanh toán
- [ ] Implement retry mechanism cho IPN callback nếu cần

## 6. Tài liệu tham khảo

- [MoMo Developer Documentation](https://developers.momo.vn)
- [MoMo Test Environment](https://test-payment.momo.vn/)
- [Ngrok Documentation](https://ngrok.com/docs)

---

> **Lưu ý**: Tài liệu này mô tả implementation đã hoàn thành. Khi test, đảm bảo backend và frontend đang chạy, và ngrok được cấu hình đúng để MoMo có thể gọi IPN callback.


http://localhost:8080/api/portal/payment/momo/manual-update?orderId=HD123&status=success