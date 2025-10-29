# Sử dụng base image Node.js phiên bản 18, loại alpine
FROM node:18-alpine

# Thiết lập thư mục làm việc
# Trỏ vào thư mục con 'potery_frontend'
WORKDIR /usr/src/app/frontend/potery_frontend

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn của frontend
COPY . .

# Mở port mà Next.js sẽ chạy (mặc định là 3000, nhưng chúng ta sẽ đổi nó)
EXPOSE 3001

# Lệnh để khởi chạy ứng dụng ở chế độ dev
# Sử dụng 'npm run dev' theo yêu cầu của bạn
CMD ["npm", "run", "dev", "--", "-p", "3001"]
