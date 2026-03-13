FROM ubuntu:22.04

# 禁用交互
ENV DEBIAN_FRONTEND=noninteractive

# 更新并安装 scrcpy 官方源 + 所有依赖
RUN apt update && apt install -y --no-install-recommends \
    curl \
    gnupg2 \
    software-properties-common \
    && add-apt-repository universe \
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
