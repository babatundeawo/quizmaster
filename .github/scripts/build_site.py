#!/usr/bin/env python3
"""Builds the website into the ./dist folder.

This runs inside GitHub Actions (nobody needs to run it by hand). It uses only
Python's standard library, so there is nothing to install.

What it does:
  1. Copies the files that belong on the website into ./dist
     (documentation, workflows and other repository files are NOT published).
  2. Writes js/firebase-env.js from the Firebase values stored in GitHub secrets.
  3. Replaces the placeholders __SITE_URL__, __REPO_URL__ and __BUILD_DATE__.
"""
import datetime
import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"

FILES = [
    "index.html",
    "404.html",
    "privacy.html",
    "manifest.json",
    "service-worker.js",
    "robots.txt",
    "sitemap.xml",
]
FOLDERS = ["css", "js", "assets"]
TEXT_SUFFIXES = {".html", ".xml", ".txt", ".json", ".js", ".css"}

# GitHub secret name -> key inside firebaseConfig
SECRETS = {
    "FIREBASE_API_KEY": "apiKey",
    "FIREBASE_AUTH_DOMAIN": "authDomain",
    "FIREBASE_PROJECT_ID": "projectId",
    "FIREBASE_STORAGE_BUCKET": "storageBucket",
    "FIREBASE_MESSAGING_SENDER_ID": "messagingSenderId",
    "FIREBASE_APP_ID": "appId",
}


def fail(message: str) -> None:
    print(f"::error::{message}")
    print(f"\nBUILD STOPPED: {message}")
    sys.exit(1)


def read_firebase_config() -> dict:
    values = {key: os.environ.get(name, "").strip() for name, key in SECRETS.items()}
    missing = [name for name, key in SECRETS.items() if not values[key]]
    if missing:
        fail(
            "These GitHub secrets are missing or empty: "
            + ", ".join(missing)
            + ". Follow docs/FIREBASE_LOGIN_SETUP.md, part 5, to add them."
        )
    placeholders = [name for name, key in SECRETS.items() if "PASTE_" in values[key]]
    if placeholders:
        fail("These secrets still contain placeholder text: " + ", ".join(placeholders))
    return values


def main() -> None:
    site_url = os.environ.get("SITE_URL", "").strip()
    if not site_url:
        fail("SITE_URL is not set. The deploy workflow sets it automatically.")
    if not site_url.endswith("/"):
        site_url += "/"

    repo = os.environ.get("GITHUB_REPOSITORY", "")
    server = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
    repo_url = os.environ.get("REPO_URL", f"{server}/{repo}" if repo else server)
    build_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")

    config = read_firebase_config()

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    for name in FILES:
        source = ROOT / name
        if not source.exists():
            fail(f"Expected file is missing from the repository: {name}")
        shutil.copy2(source, DIST / name)
    for name in FOLDERS:
        source = ROOT / name
        if not source.is_dir():
            fail(f"Expected folder is missing from the repository: {name}/")
        shutil.copytree(source, DIST / name)

    env_file = DIST / "js" / "firebase-env.js"
    env_file.write_text(
        "// Generated during the build from GitHub repository secrets. Do not edit.\n"
        "export const firebaseConfig = "
        + json.dumps(config, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    tokens = {
        "__SITE_URL__": site_url,
        "__REPO_URL__": repo_url,
        "__BUILD_DATE__": build_date,
    }
    replaced = 0
    for path in DIST.rglob("*"):
        if path.is_file() and path.suffix in TEXT_SUFFIXES:
            text = path.read_text(encoding="utf-8")
            new_text = text
            for token, value in tokens.items():
                new_text = new_text.replace(token, value)
            if new_text != text:
                path.write_text(new_text, encoding="utf-8")
                replaced += 1

    files = sum(1 for p in DIST.rglob("*") if p.is_file())
    print(f"Built {files} files into dist/ ({replaced} files had placeholders filled in).")
    print(f"Site address: {site_url}")


if __name__ == "__main__":
    main()
