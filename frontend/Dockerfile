# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# COPY yarn.lock ./ # If using Yarn

# Install dependencies
# Using --force for potential EBADENGINE issues, though ideally Node version should match
RUN npm install --force
# RUN yarn install # If using Yarn

# Copy the rest of the application code
COPY . .

# Build the application
# Vite uses 'build' script by default in package.json
RUN npm run build
# RUN yarn build # If using Yarn

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
# This file (nginx.conf) needs to be created in the same directory as the Dockerfile (frontend/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
