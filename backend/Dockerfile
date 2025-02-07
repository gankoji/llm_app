FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y git  && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY ./src/ .
COPY id_rsa.pub /root/.ssh/id_rsa.pub
COPY id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa.pub && chmod 600 /root/.ssh/id_rsa

RUN npm run build

# Create a directory for temporary files
RUN mkdir /tmp/app


EXPOSE 3000

CMD ["npm", "start"]
