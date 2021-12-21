FROM sejkom/dind

#install node 16
RUN apt update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# CMD ["npm", "run", "start"]
ENTRYPOINT ["bash","/usr/src/app/start-everything.sh"]