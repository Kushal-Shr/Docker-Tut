FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY package.json and package-lock.json first
# This caches the npm install step so it doesn't run every time you change a code file!
COPY package*.json ./

# Install the dependencies
RUN npm install

# Now copy the rest of your application code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Tell Docker that this container listens on port 3000
EXPOSE 3000

# The command to start the Next.js server
CMD ["npm", "start"]
