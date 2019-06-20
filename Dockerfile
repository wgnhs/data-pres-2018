FROM node:lts

WORKDIR /home/node/app

ADD . /home/node/app

EXPOSE 8080

CMD ["npm", "start"]