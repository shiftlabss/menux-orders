#!/bin/bash
rm -f .env
echo "NODE_ENV=development" >> .env
echo "PORT=3000" >> .env
echo "DATABASE_URL=postgres://menux:menuxSecurePass!2024@localhost:5432/menux" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env
echo "RABBITMQ_URL=amqp://guest:guest@localhost:5672" >> .env
echo "JWT_SECRET=dev_super_secret_jwt_key_123" >> .env
echo "LOG_LEVEL=debug" >> .env
cat .env
