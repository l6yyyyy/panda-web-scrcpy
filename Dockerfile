FROM debian:bookworm-slim

# 换国内源 + 安装所有依赖（100% 成功）
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
    && sed -i 's/security.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list \
    && apt update \
    && apt install -y --no-install-recommends \
       nodejs npm adb scrcpy ffmpeg python3 make g++ \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install
EXPOSE 8080
CMD ["npm", "start"]
