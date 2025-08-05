FROM node:20
WORKDIR /app

# Install build dependencies for sqlite3
RUN apt-get update && apt-get install -y \
	python3 \
	make \
	g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
# Rebuild sqlite3 for Docker environment
RUN npm rebuild sqlite3 --build-from-source

COPY . .
RUN npm run build
CMD ["npm", "start"]
