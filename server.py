from flask import Flask
from flask import request

import json


app = Flask(__name__)

@app.route('/', methods=['POST'])
def index():
    data = request.get_data()
    string_data = data.decode('utf-8')
    json_data = json.loads(string_data)
    with open('data.txt', 'a') as f:
        f.write(str(json_data))
        f.write('\n')

    return {1: 'OK'}


@app.route('/last_scrapped', methods=['GET'])
def get_last_scrapped_data():
    with open('data.txt', 'r') as f:
        data = f.readlines()
    return {'length': len(data)}

app.run(host='0.0.0.0', port=81, debug=True)
