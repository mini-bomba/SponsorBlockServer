FROM ghcr.io/ajayyy/sb-server:latest
EXPOSE 873/tcp
RUN apk add rsync>3.4.1-r0
RUN mkdir /usr/src/app/database-export

CMD rsync --no-detach --daemon & ./entrypoint.sh
