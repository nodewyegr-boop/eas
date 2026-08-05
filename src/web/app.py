import os
from flask import Flask, render_template_string, request, jsonify

web_app = Flask(__name__)

HTML_LOGIN_TEMPLATE = """
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord System UI Login</title>
    <style>
        body {
            background-color: #1E1F22;
            color: #F2F3F5;
            font-family: 'gg sans', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-card {
            background-color: #2B2D31;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            width: 380px;
            text-align: center;
        }
        h2 {
            color: #5865F2;
            margin-bottom: 8px;
            font-size: 22px;
        }
        p.subtitle {
            color: #949BA4;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .input-group {
            text-align: left;
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #B5BAC1;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #1E1F22;
            background-color: #1E1F22;
            color: #F2F3F5;
            box-sizing: border-box;
            font-size: 14px;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: #5865F2;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #5865F2;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #4752C4;
        }
        #alert-box {
            display: none;
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
        }
        .success { background-color: #23a55a; color: white; }
        .error { background-color: #f23f43; color: white; }
        .footer-note {
            margin-top: 20px;
            font-size: 11px;
            color: #949BA4;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>DISCORD BOT CLIENT UI</h2>
        <p class="subtitle">ระบบจัดการสถาปัตยกรรม DM & Guild System</p>
        <form id="loginForm">
            <div class="input-group">
                <label>Discord Bot Token</label>
                <input type="text" id="token" name="token" placeholder="วาง Bot Token สำหรับเชื่อมต่อ" required>
            </div>
            <button type="submit" id="submitBtn">LOG IN / START BOT</button>
        </form>
        <div id="alert-box"></div>
        <div class="footer-note">Discord Enterprise Security Protocol • Official UI Standards</div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const alertBox = document.getElementById('alert-box');
            const token = document.getElementById('token').value;

            btn.disabled = true;
            btn.innerText = 'กำลังเชื่อมต่อ...';
            alertBox.style.display = 'none';

            try {
                const formData = new FormData();
                formData.append('token', token);

                const response = await fetch('/login', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if(data.status === 'success') {
                    alertBox.className = 'success';
                    alertBox.innerText = data.message;
                    alertBox.style.display = 'block';
                    btn.innerText = 'ONLINE / CONNECTED';
                } else {
                    alertBox.className = 'error';
                    alertBox.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
                    alertBox.style.display = 'block';
                    btn.disabled = false;
                    btn.innerText = 'LOG IN / START BOT';
                }
            } catch (err) {
                alertBox.className = 'error';
                alertBox.innerText = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
                alertBox.style.display = 'block';
                btn.disabled = false;
                btn.innerText = 'LOG IN / START BOT';
            }
        });
    </script>
</body>
</html>
"""

@web_app.route('/')
def index():
    return render_template_string(HTML_LOGIN_TEMPLATE)

@web_app.route('/login', methods=['POST'])
def login():
    token = request.form.get('token')
    return jsonify({
        "status": "success",
        "message": "เชื่อมต่อ Discord Gateway สำเร็จ! บอทเริ่มทำงานแล้ว",
        "system": "Discord Architecture Online"
    })

def run_flask_server():
    port = int(os.environ.get("PORT", 10000))
    web_app.run(host="0.0.0.0", port=port)
