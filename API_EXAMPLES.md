# API Test Examples - Postman hoặc cURL

## Health Check
```bash
curl http://localhost:3000/health
```

## Users API

### 1. Tạo User Mới
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0912345678",
    "address": "Hà Nội"
  }'
```

### 2. Lấy Tất Cả Users
```bash
curl http://localhost:3000/api/users
```

### 3. Lấy User Theo ID
```bash
curl http://localhost:3000/api/users/{user_id}
```

### 4. Cập Nhật User
```bash
curl -X PUT http://localhost:3000/api/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "email": "newemail@example.com",
    "phone": "0987654321",
    "address": "TP.HCM",
    "status": "active"
  }'
```

### 5. Xóa User
```bash
curl -X DELETE http://localhost:3000/api/users/{user_id}
```

## Postman Collection

```json
{
  "info": {
    "name": "First App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/users"
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/users",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Nguyễn Văn A\",\n  \"email\": \"user@example.com\",\n  \"phone\": \"0912345678\",\n  \"address\": \"Hà Nội\"\n}"
        }
      }
    }
  ]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Lấy danh sách users thành công",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0912345678",
      "address": "Hà Nội",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Email đã được sử dụng",
  "data": null
}
```

## HTTP Status Codes

- `200 OK` - Thành công
- `201 Created` - Tạo mới thành công
- `400 Bad Request` - Lỗi dữ liệu
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server
