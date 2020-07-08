FROM node:10.15.3
RUN mkdir -p /usr/src/app/portal-server
WORKDIR /usr/src/app/portal-server
COPY portal-server /usr/src/app/portal-server
RUN mkdir -p /usr/src/app/portal-plugins
WORKDIR /usr/src/app/portal-plugins
COPY portal-plugins /usr/src/app/portal-plugins
WORKDIR /usr/src/app/portal-server
RUN npm install
EXPOSE 4005
CMD npm start