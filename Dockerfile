FROM node:6
ENV HOME /home/node
RUN apt-get update
RUN apt-get -y install nano vim
RUN mkdir -p /home/node/app
COPY package.json /home/node/app
ADD . /home/node/app
WORKDIR /home/node/app
RUN npm install
EXPOSE 4200
ENTRYPOINT ["sh", "-c"]
CMD ["npm start"]