// HƯỚNG DẪN MỞ RỘNG MODULAR

/*
=============================================================================
CÁCH THÊM MODULE MỚI (VD: PRODUCT MODULE)
=============================================================================
*/

// 1. TẠO MODEL - models/Product.js
// --------------------------------
/*
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá là bắt buộc'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['electronics', 'clothing', 'food', 'other'],
      default: 'other',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
*/

// 2. TẠO CONTROLLER - controllers/productController.js
// -------------------------------------------------------
/*
const Product = require('../models/Product');
const { errorHandler, successHandler } = require('../utils/responseHandler');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    successHandler(res, 200, 'Lấy danh sách sản phẩm thành công', products);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return errorHandler(res, 400, 'Tên và giá là bắt buộc');
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
    });

    await product.save();
    successHandler(res, 201, 'Tạo sản phẩm thành công', product);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Thêm các methods khác: getProductById, updateProduct, deleteProduct
*/

// 3. TẠO ROUTES - routes/productRoutes.js
// ----------------------------------------
/*
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateRequest, validateObjectId } = require('../middleware/validation');

router.get('/', productController.getAllProducts);
router.get('/:id', validateObjectId, productController.getProductById);
router.post('/', validateRequest, productController.createProduct);
router.put('/:id', validateObjectId, validateRequest, productController.updateProduct);
router.delete('/:id', validateObjectId, productController.deleteProduct);

module.exports = router;
*/

// 4. ĐĂNG KÝ ROUTES TRONG index.js
// ---------------------------------
/*
const productRoutes = require('./routes/productRoutes');

// Thêm dòng này ở phần API Routes:
app.use('/api/products', productRoutes);
*/

/*
=============================================================================
CÁCH THÊM AUTHENTICATION (JWT)
=============================================================================
*/

// 1. Cài đặt: npm install jsonwebtoken bcryptjs

// 2. Tạo middleware - middleware/auth.js
/*
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token không tồn tại',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
};

module.exports = authMiddleware;
*/

// 3. Sử dụng trong routes
/*
router.delete('/:id', authMiddleware, validateObjectId, userController.deleteUser);
*/

/*
=============================================================================
CÁCH THÊM PAGINATION VÀ FILTERING
=============================================================================
*/

// Cập nhật controller
/*
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(limit);

    successHandler(res, 200, 'Lấy danh sách users thành công', {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};
*/

// Sử dụng: GET /api/users?page=1&limit=10&status=active&search=john

/*
=============================================================================
CÁCH THÊM LOGGING (MORGAN + WINSTON)
=============================================================================
*/

// Cài đặt: npm install morgan winston

// Cấu hình logging - config/logger.js
/*
const winston = require('winston');
const morgan = require('morgan');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = { logger, morgan };
*/

// Sử dụng trong index.js
/*
const { logger, morgan } = require('./config/logger');

app.use(morgan('combined'));

// Trong error handler:
logger.error(error.message);
*/

/*
=============================================================================
CÁCH TỔ CHỨC DỰ ÁN CÓ NHIỀU MODULE
=============================================================================

Cấu trúc cho dự án lớn:

first-app/
├── config/
│   ├── database.js
│   ├── logger.js
│   └── constants.js
├── api/
│   ├── users/
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   └── userRoutes.js
│   │   └── validators/
│   │       └── userValidator.js
│   ├── products/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── validators/
│   └── orders/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       └── validators/
├── middleware/
│   ├── errorHandler.js
│   ├── validation.js
│   ├── auth.js
│   └── logging.js
├── utils/
│   ├── responseHandler.js
│   ├── validators.js
│   └── helpers.js
├── .env
├── index.js
└── README.md

*/

module.exports = 'Xem các comment ở trên để biết cách mở rộng';
