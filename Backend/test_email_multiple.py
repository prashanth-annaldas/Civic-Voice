from email_service import send_issue_email

try:
    send_issue_email(
        issue_data={
            "type": "Test Issue",
            "lat": 0.0,
            "lng": 0.0,
            "status": "Pending",
            "description": "Test description",
            "severity": 10,
            "department": "Test Department"
        },
        user_email="test1234@example.com"
    )
    print("Success: Email sent without throwing an exception.")
except Exception as e:
    print(f"Error sending email: {e}")
