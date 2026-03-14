FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# 安装依赖（一次性成功）
RUN apt update && apt install -y --no-install-recommends \
    adb \
    scrcpy \
    nodejs \
    npm \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# 安装 npm 依赖（修复版）
RUN npm install

EXPOSE 8080
CMD ["node", "server.js"]
