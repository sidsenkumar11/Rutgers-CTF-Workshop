from flask import Flask, request, redirect, render_template, session, jsonify, url_for
import requests

from db import get_profile, upsert_profile
from const import *

app = Flask(__name__)
app.secret_key = SECRET_KEY


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login")
def login():
    return redirect(
        f"{OAUTH_PROVIDER_URL}/auth/authorize?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&state=abcd&scope=https://www.googleapis.com/auth/userinfo.email"
    )


@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Invalid params"}), 400

    # Exchange code for token
    token_url = f"{OAUTH_PROVIDER_URL}/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    response = requests.post(token_url, data=data)
    token = response.json().get("access_token")

    # Use the token to get user's email
    headers = {"Authorization": f"Bearer {token}"}
    email = requests.get(USERINFO_URL, headers=headers).json().get("email")

    if not email:
        return redirect(url_for("index", message=f"Hmm...try logging in again"))

    # Create a profile and session
    if not get_profile(email):
        upsert_profile(email, "NOT_THE_REAL_FLAG!")

    session["email"] = email
    message = f"Login successful as {email}!"
    return redirect(url_for("index", message=message))


@app.route("/profile", methods=["GET", "POST"])
def profile():
    if "email" not in session:
        return jsonify({"error": "Please login first."}), 401
    email = session["email"]

    # Read or update profile
    if request.method == "GET":
        return jsonify(get_profile(email))
    else:
        flag = request.args.get("flag")
        if not flag:
            return jsonify({"error": "Missing flag param"}), 400

        upsert_profile(email, flag)
        return jsonify({"message": f"Saved flag for email {email}"})


@app.route("/visit", methods=["POST"])
def visit():
    path = request.json["path"]
    with requests.Session() as s:
        text1 = s.get(f"{HOST_URI}/{path}").text
        text2 = s.post(f"{HOST_URI}/profile?flag={FLAG}").text
        return jsonify({"message_1": text1, "message_2": text2})


if __name__ == "__main__":
    app.run(debug=True)
