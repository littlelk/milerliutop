#!/usr/bin/env python3
"""
企业微信消息接收服务 - 修复解密格式
"""

import http.server
import socketserver
import hashlib
import xml.etree.ElementTree as ET
import time
import base64
import struct
import os

# 配置
PORT = 8081
WECHAT_TOKEN = "dKRGawa7AuPLkuFNnob3snm1BlruG7GB"
ENCODING_AES_KEY = "u5qbvLqUpqNiYlEEBlIZDQAAM75xi0oysfZ5w4VAbGu"
CORP_ID = "wwe4ba7c630dcd5ab2"

LOG_FILE = "/tmp/wechat.log"

def log(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")

def pkcs7_unpad(data):
    pad_len = data[-1]
    if pad_len < 1 or pad_len > 32:
        pad_len = 0
    return data[:-pad_len]

def decrypt(encrypted_str):
    """标准的企业微信 AES 解密"""
    try:
        aes_key = base64.b64decode(ENCODING_AES_KEY + "=")
        encrypted = base64.b64decode(encrypted_str)
        
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.backends import default_backend
        
        iv = aes_key[:16]
        cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted = decryptor.update(encrypted) + decryptor.finalize()
        
        content = pkcs7_unpad(decrypted)
        
        # 解析: 4字节长度 + 随机16字节 + 内容 + 4字节长度 + CorpId
        # 企业微信返回的 echostr 是纯文本内容
        msg_len = struct.unpack('I', content[16:20])[0]
        result = content[16+4:16+4+msg_len].decode('utf-8')
        return result
    except Exception as e:
        log(f"解密失败: {e}")
        # 尝试备用解析方式
        try:
            content = pkcs7_unpad(decrypted)
            # 直接返回解密后的内容（去掉 CorpId）
            if CORP_ID.encode() in content:
                result = content[:content.rfind(CORP_ID.encode())].decode('utf-8')
                # 去掉前面的长度字段
                if len(result) > 16:
                    msg_len = struct.unpack('I', result[16:20].encode())[0]
                    return result[16+4:16+4+msg_len]
            return content.decode('utf-8')
        except:
            return None

def get_sha1(token, timestamp, nonce, echostr):
    arr = [str(token), str(timestamp), str(nonce), str(echostr)]
    arr.sort()
    return hashlib.sha1(''.join(arr).encode()).hexdigest()

class WeChatHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        from urllib.parse import parse_qs, urlparse
        query = parse_qs(urlparse(self.path).query)
        
        msg_signature = query.get('msg_signature', [''])[0]
        timestamp = query.get('timestamp', [''])[0]
        nonce = query.get('nonce', [''])[0]
        echostr = query.get('echostr', [''])[0]

        log(f"GET: sig={msg_signature[:30]}...")

        if not all([msg_signature, timestamp, nonce, echostr]):
            log("❌ 参数不完整")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'fail')
            return

        calculated = get_sha1(WECHAT_TOKEN, timestamp, nonce, echostr)

        if calculated == msg_signature:
            result = decrypt(echostr)
            if result:
                log(f"✅ 成功，解密: {result}")
                # 返回纯文本（不要额外编码）
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(result.encode('utf-8'))
                return
            else:
                log("❌ 解密失败")
        else:
            log(f"❌ 签名不匹配")

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'fail')

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        log(f"POST: {len(post_data)} bytes")

        try:
            root = ET.fromstring(post_data)
            from_user = root.find('FromUserName').text
            to_user = root.find('ToUserName').text
            content = root.find('Content').text if root.find('Content') is not None else '空'

            log(f"用户 {from_user}: {content}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/xml')
            self.end_headers()
            self.wfile.write(b'success')
        except Exception as e:
            log(f"错误: {e}")
            self.send_response(200)
            self.end_headers()

if __name__ == "__main__":
    log(f"🚀 启动端口 {PORT}")
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), WeChatHandler) as httpd:
        httpd.serve_forever()
