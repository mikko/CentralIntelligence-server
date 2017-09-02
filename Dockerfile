FROM python:3 as spacy
RUN pip install wheel socketIO-client spacy
RUN python -m spacy download en

FROM node:6
COPY --from=spacy /usr/local /usr/local/
RUN ldconfig
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY . ./
CMD ["npm", "start"]
EXPOSE 3000