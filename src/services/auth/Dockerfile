# Install
FROM node:10 as installation
WORKDIR /app
COPY package* ./
COPY *.yml ./
COPY *.ts ./
COPY tsconfig.json .
RUN npm install

# Update lambda
FROM node:10 as update
COPY --from=installation /app/ ./
CMD ["npm", "run", "deploy"]