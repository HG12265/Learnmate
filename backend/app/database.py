import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("learnmate.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False

db_instance = Database()

async def connect_to_mongo():
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000
        )
        # Verify connection
        await db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        db_instance.is_connected = True
        logger.info(f"Connected to MongoDB database '{settings.DATABASE_NAME}' successfully!")
        
        # Ensure indexes
        try:
            await db_instance.db.users.create_index("email", unique=True)
            await db_instance.db.roadmaps.create_index([("user_id", 1), ("created_at", -1)])
            await db_instance.db.module_notes.create_index([("roadmap_id", 1), ("module_id", 1)], unique=True)
            await db_instance.db.assessments.create_index("roadmap_id", unique=True)
            await db_instance.db.certificates.create_index("roadmap_id", unique=True)
        except Exception as e:
            logger.warning(f"Index creation notice: {e}")
            
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}. Will use memory fallback if needed.")
        db_instance.is_connected = False

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
