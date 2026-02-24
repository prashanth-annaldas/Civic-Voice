import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")

print(f"SENDER: {EMAIL_SENDER}")
print(f"RECEIVER: {EMAIL_RECEIVER}")
print(f"PASSWORD LENGTH: {len(EMAIL_PASSWORD) if EMAIL_PASSWORD else 0}")

try:
    msg = EmailMessage()
    msg["Subject"] = "Test Email"
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER
    msg.set_content("This is a test email")

    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.set_debuglevel(1)
    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()
    print("✅ Email sent successfully")
except Exception as e:
    print("❌ Email send failed:", e)
