import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv
from mimetypes import guess_type

load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")


def send_issue_email(issue_data: dict, image_path: str | None = None, user_email: str | None = None):
    if not EMAIL_SENDER or not EMAIL_PASSWORD or not EMAIL_RECEIVER:
        raise ValueError("Missing email environment variables")

    msg = EmailMessage()
    msg["From"] = EMAIL_SENDER
    recipients = [EMAIL_RECEIVER]
    if user_email and user_email not in recipients:
        recipients.append(user_email)
    msg["To"] = ", ".join(recipients)

    lat = issue_data.get("lat", "N/A")
    lng = issue_data.get("lng", "N/A")
    issue_type = issue_data.get("type", "unknown")
    status = issue_data.get("status", "Pending")
    description = issue_data.get("description", "")
    severity = issue_data.get("severity", 0)
    department = issue_data.get("department", "Unassigned")

    is_emergency = severity >= 85
    msg["Subject"] = f"🚨 URGENT ESCALATION: {issue_type}" if is_emergency else f"📋 New Civic Issue: {issue_type} ({department})"

    maps_link = (
        f"https://www.google.com/maps?q={lat},{lng}"
        if lat != "N/A" and lng != "N/A"
        else "Location not provided"
    )

    # Plain text fallback
    text_body = f"""
{'URGENT ESCALATION - SEVERITY CRITICAL' if is_emergency else 'New civic issue reported.'}

Type: {issue_type}
Status: {status}
Severity Score: {severity}/100
Routed Department: {department}

Latitude: {lat}
Longitude: {lng}

Description:
{description}

Map:
{maps_link}
"""

    emerg_html = "<h3 style='color:red;'>⚠️ URGENT ESCALATION - CRITICAL SEVERITY</h3>" if is_emergency else ""
    
    # HTML email
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>{'🚨 Critical' if is_emergency else '📋 New'} Civic Issue Reported</h2>
            {emerg_html}
            
            <p><b>Type:</b> {issue_type}</p>
            <p><b>Status:</b> {status}</p>
            <p><b>Severity Score:</b> <span style="color:{'red' if is_emergency else 'black'}">{severity}/100</span></p>
            <p><b>Routed Department:</b> {department}</p>

            <p>
                <b>Location:</b><br>
                Latitude: {lat}<br>
                Longitude: {lng}
            </p>

            <p>
                <a href="{maps_link}" target="_blank"
                   style="padding:10px 14px;background:#1976d2;color:white;
                          text-decoration:none;border-radius:6px;">
                    📍 View on Google Maps
                </a>
            </p>

            <p><b>Description:</b></p>
            <p>{description}</p>
        </body>
    </html>
    """

    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    # Attach image safely
    if image_path and os.path.exists(image_path):
        mime_type, _ = guess_type(image_path)
        maintype, subtype = (mime_type or "application/octet-stream").split("/", 1)

        with open(image_path, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype=maintype,
                subtype=subtype,
                filename=os.path.basename(image_path),
            )

    # Send email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

    except Exception as e:
        print("❌ Email send failed:", e)
