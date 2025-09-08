FROM golang:1.25

WORKDIR /app

CMD ["sh", "-c", "CGO_ENABLED=0 go build -C lib -ldflags='-s -w' -o '../dist/bin/balena-compose-go'"]
