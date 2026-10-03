#!/usr/bin/env python3
"""Stage DELIVERY-EMAIL.md as a Gmail DRAFT in jaden@greenaidigital.com (IMAP APPEND).
Nothing is sent. Jaden fills in the price line and hits send.
usage: python3 tools/stage_delivery_email.py [--dry-run]"""
import imaplib, ssl, os, sys, time, pathlib
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

USER = "jaden@greenaidigital.com"
PW_FILE = os.path.expanduser("~/.greenai_gmail_app_password")
HOST = "imap.gmail.com"
SRC = pathlib.Path(__file__).resolve().parent.parent / "DELIVERY-EMAIL.md"

def parse(text):
    head, body = text.split("\n\n", 1)
    h = dict(line.split(": ", 1) for line in head.splitlines())
    return h, body.strip() + "\n"

def main():
    h, body = parse(SRC.read_text())
    m = EmailMessage()
    m["From"] = h["From"]; m["To"] = h["To"]; m["Subject"] = h["Subject"]
    m["Date"] = formatdate(localtime=True); m["Message-ID"] = make_msgid(domain="greenaidigital.com")
    m.set_content(body)
    print(f"To: {m['To']}\nSubject: {m['Subject']}\n{len(m.as_bytes())} bytes")
    if "--dry-run" in sys.argv:
        print(body); return
    pw = open(PW_FILE).read().strip().replace(" ", "")
    try:
        import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    imap = imaplib.IMAP4_SSL(HOST, 993, ssl_context=ctx)
    imap.login(USER, pw)
    ok, boxes = imap.list()
    names = [b.decode(errors="replace") for b in boxes or []]
    folder = next((c for c in ["[Gmail]/Drafts", "Drafts"] if any(f'"{c}"' in n for n in names)), None)
    if not folder: sys.exit("no Drafts folder: " + "\n".join(names))
    imap.append(f'"{folder}"', "\\Draft", imaplib.Time2Internaldate(time.time()), m.as_bytes())
    imap.logout()
    print(f"DRAFTED in {USER} -> {folder}. Nothing sent.")

if __name__ == "__main__":
    main()
