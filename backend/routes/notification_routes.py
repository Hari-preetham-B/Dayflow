import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify
from models import db, User, Notification
from auth_middleware import require_auth

notification_bp = Blueprint('notification_bp', __name__)


# ============================================================
# HELPER FUNCTIONS FOR NOTIFICATIONS & BREVO/SMTP EMAIL
# ============================================================

def send_email_notification(recipient_email, subject, body_text):
    """
    Sends email via Brevo SMTP or standard SMTP if configured in .env.
    Fails gracefully without stopping main application execution if not configured.
    """
    smtp_server = os.getenv('SMTP_SERVER', 'smtp-relay.brevo.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER') or os.getenv('BREVO_USER')
    smtp_pass = os.getenv('SMTP_PASSWORD') or os.getenv('BREVO_API_KEY')
    sender_email = os.getenv('SENDER_EMAIL', 'no-reply@dayflow.com')

    if not smtp_user or not smtp_pass:
        print(f"[NOTIFY] Email notification to {recipient_email} skipped: BREVO/SMTP credentials not configured in environment.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"Dayflow HRMS <{sender_email}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port, timeout=5)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[NOTIFY] Email sent successfully to {recipient_email}")
        return True
    except Exception as e:
        print(f"[NOTIFY ERROR] Failed to send email to {recipient_email}: {str(e)}")
        return False


def create_notification(user_id, title, message, type='system'):
    """
    Creates an in-app notification record and attempts email delivery.
    """
    try:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        db.session.add(notif)
        db.session.commit()

        # Try sending email notification
        target_user = User.query.get(user_id)
        if target_user and target_user.email:
            send_email_notification(target_user.email, f"[Dayflow] {title}", message)

        return notif
    except Exception as e:
        db.session.rollback()
        print(f"[NOTIFICATION ERROR] Failed to create notification for {user_id}: {str(e)}")
        return None


def notify_admins(title, message, type='system'):
    """
    Sends an in-app notification & email to all registered Admin users.
    """
    admins = User.query.filter_by(role='admin').all()
    created = []
    for admin in admins:
        n = create_notification(admin.id, title, message, type=type)
        if n:
            created.append(n)
    return created


# ============================================================
# API ENDPOINTS FOR IN-APP NOTIFICATIONS
# ============================================================

@notification_bp.route('/api/notifications/my', methods=['GET'])
@require_auth
def get_my_notifications():
    """
    Fetch all notifications for the authenticated user along with unread count.
    """
    req_supabase_id = request.supabase_user.get("id")
    notifs = Notification.query.filter_by(user_id=req_supabase_id).order_by(Notification.created_at.desc()).all()
    unread_count = Notification.query.filter_by(user_id=req_supabase_id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count
    }), 200


@notification_bp.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@require_auth
def mark_notification_read(notification_id):
    """
    Mark a specific notification as read.
    """
    req_supabase_id = request.supabase_user.get("id")
    notif = Notification.query.get(notification_id)

    if not notif or notif.user_id != req_supabase_id:
        return jsonify({"error": "Notification not found or unauthorized"}), 404

    notif.is_read = True
    db.session.commit()

    return jsonify({
        "message": "Notification marked as read",
        "notification": notif.to_dict()
    }), 200


@notification_bp.route('/api/notifications/read-all', methods=['PUT'])
@require_auth
def mark_all_notifications_read():
    """
    Mark all unread notifications for current user as read.
    """
    req_supabase_id = request.supabase_user.get("id")
    Notification.query.filter_by(user_id=req_supabase_id, is_read=False).update({"is_read": True})
    db.session.commit()

    return jsonify({
        "message": "All notifications marked as read"
    }), 200
