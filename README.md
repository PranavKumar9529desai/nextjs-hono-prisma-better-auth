# Next.js + Hono + Prisma - Mongo + BetterAuth

## Tech stack

- Next.js 15
- Hono
- Prisma
- Mongo
- BetterAuth

## Features

- Private route with middleware
- SWR
- Hono RPC

## Setup

```bash
bun install

cp .env.template .env
```

## Prisma

```bash
bun run prisma:generate
```

## Run

```bash
bun run dev
```

### Role based Access Control
- 3 level access owner,trainer and user.
- owner has all permission and access.
- trainer can manage user attached to it.
- user can simply view details of the gym and "attendance "record.
- using BetterAuth for the authentication.
