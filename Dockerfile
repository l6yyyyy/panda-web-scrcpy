FROM debian:bookworm-slim

RUN apt update \
    && apt install -y --no-install-recommends \
       nodejs npm adb scrcpy ffmpeg python3 make g++ \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install
EXPOSE 8080
CMD ["npm", "start"]
