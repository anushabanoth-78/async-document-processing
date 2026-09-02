from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# For asyncpg, instead of sslmode=require in the URL, we pass ssl=True as a connect_arg
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False,
    connect_args={"ssl": True},
    pool_pre_ping=True,
    pool_recycle=3600
)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with async_session_maker() as session:
        yield session
