# REST API với Node.js và MongoDB

Ứng dụng REST API xây dựng với Express.js, Mongoose, và MongoDB. Cấu trúc modular có thể mở rộng.

## 📋 Yêu cầu

- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

## 📁 Cấu trúc Dự án

```
first-app/
├── config/              # Cấu hình ứng dụng
│   └── database.js      # Kết nối MongoDB
├── controllers/         # Xử lý logic nghiệp vụ
│   └── userController.js
├── models/              # Mongoose schemas
│   └── User.js
├── routes/              # API routes
│   └── userRoutes.js
├── middleware/          # Custom middlewares
│   ├── errorHandler.js
│   └── validation.js
├── utils/               # Tiện ích, helpers
│   └── responseHandler.js
├── .env                 # Biến môi trường
├── .gitignore
├── package.json
└── index.js            # Entry point
```

## 🚀 Cài đặt

1. Clone/tải dự án
```bash
cd first-app
```

2. Cài đặt dependencies
```bash
npm install
```

3. Tạo file `.env` và cấu hình:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/first-app
NODE_ENV=development
```

4. Chắc chắn MongoDB đang chạy

5. Khởi động server
```bash
# Development (với hot reload)
npm run dev

# Production
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Endpoints

### Users

#### Lấy tất cả users
```
GET /api/users
```

#### Lấy một user theo ID
```
GET /api/users/:id
```

#### Tạo user mới
```
POST /api/users
Content-Type: application/json

{
  "name": "Tên người dùng",
  "email": "email@example.com",
  "phone": "0912345678",
  "address": "Địa chỉ"
}
```

#### Cập nhật user
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Tên mới",
  "email": "email@example.com",
  "phone": "0912345678",
  "address": "Địa chỉ mới",
  "status": "active"
}
```

#### Xóa user
```
DELETE /api/users/:id
```

#### Health Check
```
GET /health
```

## 🔧 Thêm Module Mới

### 1. Tạo Model mới

Tạo file `models/Product.js`:
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // ... các fields khác
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
```

### 2. Tạo Controller

Tạo file `controllers/productController.js`:
```javascript
const Product = require('../models/Product');
const { successHandler, errorHandler } = require('../utils/responseHandler');

exports.getAllProducts = async (req, res) => {
  // logic
};

// ... các functions khác
```

### 3. Tạo Routes

Tạo file `routes/productRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
// ... routes khác

module.exports = router;
```

### 4. Đăng ký Routes trong index.js

```javascript
const productRoutes = require('./routes/productRoutes');

app.use('/api/products', productRoutes);
```

## 🛡️ Tính năng Bảo mật

- **Helmet**: Bảo vệ headers HTTP
- **CORS**: Kiểm soát yêu cầu cross-origin
- **Validation**: Kiểm tra input từ client
- **Error Handling**: Xử lý lỗi tập trung

## 📝 Scripts npm

- `npm start` - Chạy production
- `npm run dev` - Chạy development với hot reload
- `npm test` - Chạy tests

## 📄 License

ISC
