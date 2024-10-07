from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo

from const import DB_URI

client = MongoClient(DB_URI, server_api=ServerApi("1"))
db = client.rutgers_cs_club
profiles = db.profiles
profiles.create_index([("email", pymongo.DESCENDING)], unique=True)


def upsert_profile(email: str, flag: str):
    filter_criteria = {"email": email}
    update_data = {"$set": {"email": email, "flag": flag}}
    profiles.update_one(filter_criteria, update_data, upsert=True)


def get_profile(email):
    prof = profiles.find_one({"email": email})
    if not prof:
        return None

    return {"email": prof["email"], "flag": prof["flag"]}
