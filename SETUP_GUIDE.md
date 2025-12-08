# Hướng dẫn Setup Dự án Flashcard Study App

## 📋 Yêu cầu hệ thống

- Python 3.9+
- Node.js 16+
- PostgreSQL (hoặc SQLite cho development)
- Git

## 🚀 Quick Start

### 1. Clone repository

```bash
git clone <your-repo-url>
cd flashcard-study-app
```

### 2. Setup Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn

# Chạy server
python run.py
# hoặc
uvicorn app.main:app --reload
```

### 3. Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### 4. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🔧 Cấu hình Database

### Option 1: SQLite (Development)

Trong file `.env`:
```env
DATABASE_URL=sqlite:///./flashcard_app.db
```

### Option 2: PostgreSQL

1. Cài đặt PostgreSQL
2. Tạo database:
```sql
CREATE DATABASE flashcard_db;
```

3. Cấu hình trong `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/flashcard_db
```

## 🔑 Cấu hình OpenAI (Optional)

Để sử dụng tính năng AI generate flashcards:

1. Lấy API key từ https://platform.openai.com/
2. Thêm vào `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

## 📝 Tạo User đầu tiên

1. Mở http://localhost:3000/register
2. Tạo tài khoản mới
3. Đăng nhập và bắt đầu sử dụng

## 🧪 Test API

Sử dụng Swagger UI tại http://localhost:8000/docs để test các API endpoints.

## 🐛 Troubleshooting

### Lỗi kết nối database

- Kiểm tra DATABASE_URL trong `.env`
- Đảm bảo database đã được tạo
- Kiểm tra credentials

### Lỗi CORS

- Kiểm tra CORS settings trong `backend/app/main.py`
- Đảm bảo frontend URL được thêm vào allowed origins

### Lỗi import modules

- Đảm bảo đang ở đúng thư mục
- Kích hoạt virtual environment
- Cài đặt lại dependencies: `pip install -r requirements.txt`

## 📚 Tài liệu thêm

- Xem [README.md](README.md) để biết thêm chi tiết
- Xem [VSCode_VM_Connection_Guide.md](VSCode_VM_Connection_Guide.md) để kết nối VSCode với VM

