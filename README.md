# 🛒 BE eCommerce

[![Node.js](https://img.shields.io/badge/node-%3E%3D16-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.x-blue?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/prisma-ORM-orange?logo=prisma)](https://www.prisma.io/)
[![Swagger](https://img.shields.io/badge/docs-Swagger-brightgreen?logo=swagger)](http://localhost:4000/api-docs)
[![Winston](https://img.shields.io/badge/logging-winston-yellow)](https://github.com/winstonjs/winston)
[![License: MIT](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

Backend API untuk aplikasi **e-commerce** berbasis **Node.js + Express + Prisma**.  
Proyek ini dibuat modular agar mudah dikembangkan, dilengkapi dengan **Swagger API Docs**, **logging dengan rotasi harian**, serta middleware **error handling** yang terstruktur.

---

## 🚀 Fitur Utama

- **Authentication & Authorization**
  - Registrasi, login, proteksi route dengan JWT (opsional jika sudah diimplementasikan).
- **Manajemen Data**
  - CRUD Users
  - CRUD Merchants
  - CRUD Products
- **Dokumentasi API**
  - Swagger UI tersedia di `/api-docs`.
- **Logging**
  - Menggunakan **Winston + Morgan** dengan rotasi harian.
  - Terpisah untuk `access.log`, `info.log`, dan `error.log`.
- **Error Handling**
  - Middleware untuk menangani 404 dan error global.
- **Struktur Modular**
  - Routes, controllers, middleware, dan utils terorganisir.

---

## 📂 Struktur Direktori

```bash
be-ecommerce/
├── controllers/          # Logic untuk setiap resource
├── docs/                 # Swagger setup
│   └── swagger.js
├── middleware/           # Middleware global (error handler, auth, dll)
│   └── errorHandler.js
├── prisma/               # Schema dan migrasi database (Prisma)
├── routes/               # Routing modular
│   ├── index.js
│   ├── usersRoutes.js
│   ├── merchantRoutes.js
│   └── productRoutes.js
├── utils/                # Logger dan helper lainnya
│   └── logger.js
├── public/               # Static files (opsional)
├── logs/                 # Hasil log rotasi harian
├── .env                  # Konfigurasi environment
├── index.js              # Entry point aplikasi
├── package.json
└── README.md
    