FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y --no-install-recommends \
    adb \
    scrcpy \
    nodejs \
    npm \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080 8081
CMD ["node", "server.js"]
