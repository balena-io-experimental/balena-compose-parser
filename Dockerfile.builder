FROM golang:1.25

WORKDIR /app

CMD ["./scripts/build-binary.sh"]
