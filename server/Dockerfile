FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Copy the Postgres Prisma schema and generate the client
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 5000
CMD ["npm", "start"]
