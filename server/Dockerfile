FROM node:18-alpine as build-image
#RUN apk add --no-cache curl \
#    && curl -fsSL 'https://github.com/pnpm/pnpm/releases/download/v8.7.6/pnpm-linuxstatic-x64' -o /bin/pnpm \
#    && chmod +x /bin/pnpm

WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY ./src ./src
COPY package.json pnpm-lock.yaml ./

# Add python for 
# RUN apk add g++ make py3-pip node-gyp
RUN apk --no-cache add --virtual .builds-deps build-base cmake make gcc libc-dev g++ openblas-dev libx11-dev python3 py3-pip
RUN apk add pkgconfig libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev
# libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev
# RUN apk add --no-cache --virtual .gyp \
#         python \
#         make \
#         g++

# RUN pnpm install node-gyp
# RUN pnpm install node-gyp-build
# RUN pnpm install --prod --frozen-lockfile
# RUN pnpm install -D tsc-alias@1.8.8 tsconfig-paths@4.2.0 tslib@2.6.2 typescript@5.2.2
# RUN npm explore npm/node_modules/@npmcli/run-script -g -- npm_config_global=false npm install --omit=dev node-gyp@latest
# RUN npm install --omit=dev && npm rebuild bcrypt --build-from-source && npm cache clean --force 
# RUN npm install node-gyp@latest
RUN npm install --omit=dev node-gyp node-gyp-build
RUN npm install -D tsc-alias@1.8.8 tsconfig-paths@4.2.0 tslib@2.6.2 typescript@5.2.2
RUN npm run build

#
#
#

#FROM node:18-alpine
#RUN apk add --no-cache curl \
#    && curl -fsSL 'https://github.com/pnpm/pnpm/releases/download/v8.7.6/pnpm-linuxstatic-x64' -o /bin/pnpm \
#    && chmod +x /bin/pnpm
#WORKDIR /usr/src/app
#COPY package.json pnpm-lock.yaml ./
#COPY --from=build-image ./usr/src/app/dist ./dist
#RUN npm install --omit=dev node-gyp node-gyp-build
#RUN npm install -D tsc-alias@1.8.8 tsconfig-paths@4.2.0 tslib@2.6.2 typescript@5.2.2
#COPY . .
#EXPOSE 8080

FROM node:18-alpine

RUN apk --no-cache add --virtual .builds-deps build-base cmake make gcc libc-dev g++ openblas-dev libx11-dev python3 py3-pip
RUN apk add pkgconfig libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
COPY --from=build-image ./usr/src/app/dist ./dist

RUN npm install --omit=dev node-gyp node-gyp-build
RUN npm install -D tsc-alias@1.8.8 tsconfig-paths@4.2.0 tslib@2.6.2 typescript@5.2.2
COPY . .
EXPOSE 8080

CMD [ "npm", "run", "start:flyio" ]
