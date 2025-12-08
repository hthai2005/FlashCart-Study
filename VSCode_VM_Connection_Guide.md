# Hướng dẫn kết nối VSCode với Máy ảo (VM)

Hướng dẫn này sẽ giúp bạn kết nối VSCode trên máy local với code trên máy ảo để phát triển dự án Flashcard Study App.

## Phương pháp 1: Remote SSH Extension (Khuyến nghị)

### Bước 1: Cài đặt Remote SSH Extension

1. Mở VSCode
2. Vào Extensions (Ctrl+Shift+X)
3. Tìm và cài đặt extension **"Remote - SSH"** (Microsoft)

### Bước 2: Cấu hình SSH Connection

1. Trên máy ảo, đảm bảo SSH server đã được cài đặt:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install openssh-server
sudo systemctl start ssh
sudo systemctl enable ssh

# Kiểm tra IP của VM
ip addr show
# hoặc
hostname -I
```

2. Trên máy local, mở VSCode Command Palette (Ctrl+Shift+P)
3. Chọn "Remote-SSH: Connect to Host"
4. Chọn "Configure SSH Hosts..."
5. Chọn file config (thường là `~/.ssh/config` hoặc `C:\Users\YourName\.ssh\config` trên Windows)

6. Thêm cấu hình:
```
Host vm-flashcard
    HostName <IP_ADDRESS_OF_VM>
    User <USERNAME_ON_VM>
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Ví dụ:
```
Host vm-flashcard
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

### Bước 3: Tạo SSH Key (nếu chưa có)

Trên máy local:
```bash
# Windows PowerShell hoặc Git Bash
ssh-keygen -t rsa -b 4096

# Copy public key sang VM
ssh-copy-id user@vm-ip-address
# hoặc
cat ~/.ssh/id_rsa.pub | ssh user@vm-ip-address "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Bước 4: Kết nối

1. Trong VSCode, nhấn F1 hoặc Ctrl+Shift+P
2. Chọn "Remote-SSH: Connect to Host"
3. Chọn "vm-flashcard" (hoặc host bạn vừa cấu hình)
4. VSCode sẽ mở cửa sổ mới kết nối với VM
5. Mở folder dự án: File > Open Folder > chọn thư mục dự án

## Phương pháp 2: Sử dụng Git (Đơn giản hơn)

### Bước 1: Khởi tạo Git Repository

Trên máy ảo:
```bash
cd /path/to/project
git init
git add .
git commit -m "Initial commit"
```

### Bước 2: Push lên GitHub

```bash
# Tạo repository trên GitHub
# Sau đó:
git remote add origin https://github.com/yourusername/flashcard-app.git
git branch -M main
git push -u origin main
```

### Bước 3: Clone về máy local

Trên máy local:
```bash
git clone https://github.com/yourusername/flashcard-app.git
cd flashcard-app
code .
```

### Bước 4: Đồng bộ code

**Từ VM sang Local:**
```bash
# Trên VM
git add .
git commit -m "Update code"
git push

# Trên Local
git pull
```

**Từ Local sang VM:**
```bash
# Trên Local
git add .
git commit -m "Update code"
git push

# Trên VM
git pull
```

## Phương pháp 3: Sử dụng VS Code Dev Containers (Docker)

Nếu VM chạy Docker:

1. Cài đặt extension **"Dev Containers"** trong VSCode
2. Tạo file `.devcontainer/devcontainer.json`:
```json
{
  "image": "python:3.11",
  "forwardPorts": [8000, 3000],
  "postCreateCommand": "pip install -r backend/requirements.txt && cd frontend && npm install"
}
```

## Phương pháp 4: Sử dụng Samba/SMB Share (Windows)

### Trên VM (Linux):

1. Cài đặt Samba:
```bash
sudo apt-get install samba
```

2. Cấu hình Samba:
```bash
sudo nano /etc/samba/smb.conf
```

Thêm vào cuối file:
```
[flashcard-app]
   path = /path/to/project
   browseable = yes
   writable = yes
   valid users = your-username
```

3. Tạo Samba user:
```bash
sudo smbpasswd -a your-username
```

4. Restart Samba:
```bash
sudo systemctl restart smbd
```

### Trên máy local (Windows):

1. Mở File Explorer
2. Nhập: `\\vm-ip-address\flashcard-app`
3. Đăng nhập với Samba credentials
4. Map network drive (tùy chọn)
5. Mở folder trong VSCode

## Troubleshooting

### Lỗi kết nối SSH

1. **Kiểm tra firewall trên VM:**
```bash
sudo ufw allow 22
sudo ufw status
```

2. **Kiểm tra SSH service:**
```bash
sudo systemctl status ssh
```

3. **Kiểm tra kết nối từ terminal:**
```bash
ssh user@vm-ip-address
```

### Lỗi permission

```bash
# Trên VM
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Lỗi Git sync

```bash
# Kiểm tra remote
git remote -v

# Force pull (cẩn thận!)
git fetch origin
git reset --hard origin/main
```

## Tips & Best Practices

1. **Sử dụng .gitignore** để tránh commit các file không cần thiết
2. **Commit thường xuyên** với messages rõ ràng
3. **Tạo branches** cho các tính năng mới:
   ```bash
   git checkout -b feature/new-feature
   ```
4. **Sử dụng VS Code Settings Sync** để đồng bộ cài đặt
5. **Cấu hình SSH key** để không cần nhập password mỗi lần

## Cấu hình VSCode cho dự án

Tạo file `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true
  }
}
```

## Kết luận

- **Phương pháp 1 (Remote SSH)**: Tốt nhất cho development trực tiếp trên VM
- **Phương pháp 2 (Git)**: Đơn giản, phù hợp cho collaboration
- **Phương pháp 3 (Dev Containers)**: Tốt nếu sử dụng Docker
- **Phương pháp 4 (SMB)**: Phù hợp cho Windows users

Chọn phương pháp phù hợp nhất với setup của bạn!

