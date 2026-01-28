# NexusGen AI Platform - Docker Infrastructure

This directory contains the Docker configuration for the NexusGen AI platform's development and production infrastructure.

## Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| PostgreSQL | postgres:16-alpine | 5432 | Primary database with pgvector support |
| Redis | redis:7-alpine | 6379 | Caching and session storage |

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Environment Setup

Copy the example environment file and customize if needed:

```bash
cp docker/.env.example .env
```

### 2. Start Services

From the project root directory:

```bash
# Start all services in detached mode
docker compose up -d

# Start with logs visible
docker compose up

# Start specific service
docker compose up -d postgres
docker compose up -d redis
```

### 3. Verify Services

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f postgres
docker compose logs -f redis
```

## Stopping Services

```bash
# Stop all services (preserves data)
docker compose stop

# Stop and remove containers (preserves volumes)
docker compose down

# Stop and remove everything including volumes (WARNING: deletes all data)
docker compose down -v
```

## Connecting to Services

### PostgreSQL

```bash
# Connect via psql
docker compose exec postgres psql -U nexusgen -d nexusgen

# Or from host (if psql is installed)
psql -h localhost -U nexusgen -d nexusgen
# Password: nexusgen_dev
```

**Connection String:**
```
postgresql://nexusgen:nexusgen_dev@localhost:5432/nexusgen
```

### Redis

```bash
# Connect via redis-cli
docker compose exec redis redis-cli -a redis_dev

# Or from host (if redis-cli is installed)
redis-cli -h localhost -p 6379 -a redis_dev
```

**Connection String:**
```
redis://:redis_dev@localhost:6379
```

## Health Checks

Both services include health checks. View health status:

```bash
docker compose ps
docker inspect nexusgen-postgres --format='{{.State.Health.Status}}'
docker inspect nexusgen-redis --format='{{.State.Health.Status}}'
```

## PostgreSQL Extensions

The following extensions are automatically enabled on first startup:

- **uuid-ossp** - UUID generation functions
- **pgcrypto** - Cryptographic functions
- **pg_trgm** - Trigram text similarity
- **vector** - pgvector for AI embeddings

Verify extensions are installed:

```sql
SELECT extname, extversion FROM pg_extension;
```

## Data Persistence

Data is persisted in Docker volumes:

- `nexusgen-postgres-data` - PostgreSQL data
- `nexusgen-redis-data` - Redis data

View volumes:

```bash
docker volume ls | grep nexusgen
```

## Troubleshooting

### Port Already in Use

If ports 5432 or 6379 are already in use:

```bash
# Check what's using the port
sudo lsof -i :5432
sudo lsof -i :6379

# Stop the conflicting service or change ports in docker-compose.yml
```

### Reset Database

```bash
# Remove PostgreSQL volume and recreate
docker compose down
docker volume rm nexusgen-postgres-data
docker compose up -d postgres
```

### View Container Logs

```bash
# All logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Check Extension Installation

If pgvector extension fails to load, the postgres:16-alpine image includes pgvector by default. If issues persist:

```bash
docker compose exec postgres psql -U nexusgen -d nexusgen -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## Production Considerations

For production deployments:

1. **Change default passwords** in `.env`:
   ```
   POSTGRES_PASSWORD=<strong-random-password>
   REDIS_PASSWORD=<strong-random-password>
   ```

2. **Enable SSL/TLS** for database connections

3. **Configure backup strategy** for volumes

4. **Set resource limits** in docker-compose.yml:
   ```yaml
   services:
     postgres:
       deploy:
         resources:
           limits:
             memory: 2G
             cpus: '2'
   ```

5. **Use external secrets management** (Docker Secrets, Vault, etc.)

## Network

All services communicate over the `nexusgen-network` bridge network. Application containers should join this network to access the services:

```yaml
services:
  your-app:
    networks:
      - nexusgen-network

networks:
  nexusgen-network:
    external: true
```
