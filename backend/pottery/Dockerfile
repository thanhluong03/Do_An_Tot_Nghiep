# Sử dụng base image Node.js phiên bản 18, loại alpine để nhẹ hơn
FROM node:18-alpine

# Thiết lập thư mục làm việc bên trong container
# Trỏ vào thư mục con 'pottery' nơi chứa mã nguồn
WORKDIR /usr/src/app/backend/pottery

# Sao chép package.json và package-lock.json (hoặc yarn.lock)
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn của backend vào container
COPY . .

# Lệnh để khởi chạy ứng dụng khi container bắt đầu
# Sử dụng 'npm start' theo yêu cầu của bạn
CMD [ "npm", "start" ]
