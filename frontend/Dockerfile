FROM node:20-alpine AS build
WORKDIR /app
# Nhận API URL lúc build (Railway truyền vào qua build args)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Railway injects $PORT — replace the listen port before starting nginx
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80/listen ${PORT:-80}/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
