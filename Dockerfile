# Dockerfile – bản chỉnh sửa cho Railway, hỗ trợ whisper-ctranslate2
# Tối ưu BLAS cho numpy/scipy trong whisper-ctranslate2 bằng libopenblas0-pthread
FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    libopenblas0-pthread \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

RUN pip install --upgrade pip --no-cache-dir && \
    pip install -U openai-whisper whisper-ctranslate2 --no-cache-dir

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci   # Cài cả devDependencies để build

# Copy source code
COPY . .

RUN npx prisma generate

# Build Next.js
RUN npm run build

RUN npm prune --production

# Env
ENV NODE_ENV=production
ENV PYTHONIOENCODING=utf-8
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]