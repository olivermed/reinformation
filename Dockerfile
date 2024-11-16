FROM node:20

RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

RUN git clone https://github.com/olivermed/reinformation.git /app

COPY .env .

RUN mkdir DB

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "Scripts/migrateJson.ts", "DB/json/acteur/*"]