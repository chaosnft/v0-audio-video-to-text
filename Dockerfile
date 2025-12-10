# Dockerfile (đã fix hoàn chỉnh – dùng được trên Render ngay)
FROM node:20-bookworm

# Cài FFmpeg + Python + pip
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Cài Whisper (bắt buộc --break-system-packages trên Debian 12+)
RUN pip3 install --upgrade pip --break-system-packages && \
    pip3 install -U openai-whisper --break-system-packages

# Tạo folder app
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài TẤT CẢ dependencies (cả devDependencies để build được)
RUN npm ci

# Copy source code
COPY . .

# Build Next.js (bắt buộc có devDependencies)
RUN npm run build

# Sau khi build xong thì xóa devDependencies để image nhẹ hơn (tùy chọn nhưng rất tốt)
RUN npm prune --production

# Env cần thiết
ENV NODE_ENV=production
ENV PYTHONIOENCODING=utf-8
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]