# Install stage
FROM node:10 as installer
WORKDIR /installs
COPY package* ./
RUN npm install

# Copy testing essentials
FROM node:10 as essentials
WORKDIR /app
COPY --from=installer /installs/node_modules ./node_modules
COPY ./src ./src
COPY package* ./
COPY jest.config.js .
COPY jest-coverage.config.js .
COPY tsconfig.json .
COPY .eslintignore .
COPY .eslintrc.yaml .
COPY .prettierrc.yaml .

# Development stage
FROM node:10 as dev
WORKDIR /app
COPY --from=essentials /app/ ./
COPY ./template ./template

# Testing stage
FROM node:10 as tester
WORKDIR /app
COPY --from=essentials /app/ ./
RUN npm test -- --no-color --json

