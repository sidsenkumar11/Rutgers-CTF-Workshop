import os
from dotenv import load_dotenv
load_dotenv('.env')

USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
OAUTH_PROVIDER_URL = "https://accounts.google.com/o/oauth2"
CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
DB_URI = os.environ["DB_URI"]
FLAG = os.environ.get("FLAG")

HOST_URI = os.environ["HOST_URI"]
REDIRECT_URI = f"{HOST_URI}/callback"
