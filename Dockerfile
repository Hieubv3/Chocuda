FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Thư mục lưu ảnh upload (server-side) — nên mount volume bền vững vào đây
RUN mkdir -p /app/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
