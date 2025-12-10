# Dockerfile – bản cuối cùng, chạy ngon trên Render ngay
FROM node:20-bookworm

# Cài FFmpeg + Python + pip
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Cài Whisper
RUN pip3 install --upgrade pip --break-system-packages && \
    pip3 install -U openai-whisper --break-system-packages

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci   # Cài cả devDependencies để build

# Copy source code
COPY . .

# QUAN TRỌNG: Generate Prisma Client trước khi build Next.js
RUN npx prisma generate

# Build Next.js
RUN npm run build

# (Tùy chọn) Xóa devDependencies sau khi build xong để image nhẹ
RUN npm prune --production

# Env
ENV NODE_ENV=production
ENV PYTHONIOENCODING=utf-8
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]