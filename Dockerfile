# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy configuration files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Database url variable
ENV DATABASE_URL="postgresql://mntop:mntop@host.docker.internal:5432/mntop"

# Generate Prisma Client
RUN npx prisma generate --sql

# Build the application
RUN yarn build

# Re-install only production dependencies to keep the image small
# We run prisma generate again to ensure the production node_modules has the client
RUN rm -rf node_modules && \
    yarn install --frozen-lockfile --production && \
    npx prisma generate --sql

# Stage 2: Production
FROM node:24-alpine

WORKDIR /app

# Copy only necessary files from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Environment variables
ENV NODE_ENV=production

# Application port
EXPOSE 4000

# Run the app
CMD ["node", "dist/main"]
