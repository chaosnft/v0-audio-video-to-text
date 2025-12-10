# Dockerfile (tại root)
FROM node:20-bookworm  # Node 20 + Debian (cho Python install)

# Install system deps: FFmpeg, Python 3.10+, pip
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install OpenAI Whisper globally via pip
RUN pip3 install --upgrade pip && \
    pip3 install -U openai-whisper

# Set working dir
WORKDIR /app

# Copy package.json and install Node deps
COPY package*.json ./
RUN npm ci --production  # Production install (skip dev deps)

# Copy app code
COPY . .

# Build Next.js
RUN npm run build

# Expose port (Render defaults 10000, but Next.js 3000)
EXPOSE 3000

# Env for Python UTF-8 (fix Unicode error)
ENV PYTHONIOENCODING=utf-8

# Start app
CMD ["npm", "start"]