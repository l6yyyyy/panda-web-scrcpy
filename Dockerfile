FROM node:18-alpine

RUN apk add --no-cache adb scrcpy ffmpeg python3 py3-pip make g++

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 8080
CMD ["npm", "start"]
