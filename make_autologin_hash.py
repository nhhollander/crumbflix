#!/usr/bin/env python3

import json
import base64

username = input("Username: ")
password = input("Password: ")

if username == "":
    username = None
if password == "":
    password = None

j = json.dumps({
      "name": username,
      "key": password
    })
j = j.encode('utf-8')
encoded = base64.b64encode(j)
print(encoded.decode())
