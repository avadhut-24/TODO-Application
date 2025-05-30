FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Since we're using tsx for running TypeScript directly, we don't need a build step
# The application will be compiled at runtime

EXPOSE 3000

# Use the dev script which uses tsx to run TypeScript directly
CMD ["npm", "run", "dev"] 