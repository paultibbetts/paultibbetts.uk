# syntax=docker/dockerfile:1.7

FROM node:24-bookworm AS builder

ARG HUGO_VERSION=0.163.3
ARG TARGETARCH
ARG HUGO_BASEURL

ENV HUGO_ENVIRONMENT=production
ENV HUGO_ENV=production
ENV TZ=Europe/London

WORKDIR /site

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git wget \
  && rm -rf /var/lib/apt/lists/*

RUN case "${TARGETARCH}" in \
    amd64|arm64) hugo_arch="${TARGETARCH}" ;; \
    *) echo "Unsupported architecture: ${TARGETARCH}" >&2; exit 1 ;; \
  esac \
  && wget -O /tmp/hugo.deb "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${hugo_arch}.deb" \
  && dpkg -i /tmp/hugo.deb \
  && rm /tmp/hugo.deb

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN HUGO_BASEURL="${HUGO_BASEURL}" ./scripts/build.sh

FROM nginx:1.31-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /site/public /usr/share/nginx/html
