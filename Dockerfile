# FROM silberjan/dind-node:latest
FROM docker:dind
# FROM gitlab/dind

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

#install node 16
RUN apk update
# RUN apk add --update nodejs=16.13.1-r0
RUN apk add nodejs-current
RUN apk add npm

# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD ["npm", "run", "start"]
