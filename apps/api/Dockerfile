FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm install -g tsx
EXPOSE 3001
CMD ["tsx", "src/index.ts"]
