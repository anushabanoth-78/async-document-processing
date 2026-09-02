import asyncio
from redis.asyncio import Redis

async def test_redis():
    url = "rediss://default:AZJJAAIncDE0YjViNGEwNGExYWU0N2MyYjhiN2U1MmE3MDcyNzNhMXAxMzc0NDk@talented-sunfish-37449.upstash.io:6379"
    try:
        r = Redis.from_url(url, decode_responses=True)
        print(f"Pinging Redis at {url.split('@')[-1]}...")
        result = await r.ping()
        print(f"Redis Ping Result: {result}")
        await r.close()
    except Exception as e:
        print(f"Redis Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis())
