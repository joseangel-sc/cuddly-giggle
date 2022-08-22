from flask import Flask
from flask import request
from flask_cors import CORS
from flask_cors import cross_origin

import json

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/', methods=['POST'])
@cross_origin(supports_credentials=True)
def index():
    data = request.get_data()
    string_data = data.decode('utf-8')
    if "NUM SA DE CV" in string_data:
        print('skipping num 1')
        return {1: 'OK'}
    data_dict = json.loads(string_data)
    with open('data.txt', 'a') as f:
        json.dump(data_dict, f)
        f.write('\n')

    return {1: 'OK'}


@app.route('/last_scrapped', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_last_scrapped_data():
    with open('data.txt', 'r') as f:
        data = f.readlines()
    last_row_data = json.loads(data[-1])
    next_page = int(list(last_row_data.keys())[0]) + 1
    return {'length': next_page}

app.run(host='0.0.0.0', port=81, debug=True)
