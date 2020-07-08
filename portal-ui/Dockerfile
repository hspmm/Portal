FROM node:10.15.3
RUN mkdir -p /usr/src/app/portal-ui
WORKDIR /usr/src/app/portal-ui
COPY portal-ui /usr/src/app/portal-ui
RUN npm install
EXPOSE 4206
CMD npm start

