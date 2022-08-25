from flask import Flask
from flask import request
from flask_cors import CORS
from flask_cors import cross_origin

import json

app = Flask(__name__)
CORS(app, support_credentials=True)


def get_last_detail_scraped():
    with open('details.txt', 'r') as f:
        read = f.readlines()
    if len(read) == 0:
        return 1, 0

    data = json.loads(read[-1])
    last_page = data['page']
    last_row = data['row']

    return last_page, last_row


def get_next_registry(last_page, last_row):
    with open('data.txt', 'r') as f:
        data = f.readlines()
    pages_per_page = 14
    next_page = last_page
    next_row = last_row + 1
    if last_row == pages_per_page:
        next_row = 0
        next_page += 1
    page = data[last_page-1]
    page_dict = json.loads(page)
    companies_list = page_dict[str(last_page)]

    return {"registry": companies_list[last_row]['registry'], "page": next_page, "row": next_row}


@app.route('/', methods=['POST'])
@cross_origin(supports_credentials=True)
def index():
    data = request.get_data()
    string_data = data.decode('utf-8')
    data_dict = json.loads(string_data)
    if "1" in data_dict:
        with open('data.txt', 'r') as f:
            data = f.readlines()
        if len(data) != 0:
            print('skiping num 1, repeated sorry')
            return {1: 'OK'}
    with open('data.txt', 'a') as f:
        json.dump(data_dict, f, ensure_ascii=False)
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


@app.route('/post_details', methods=['POST'])
@cross_origin(supports_credentials=True)
def post_details():
    data = request.get_data()
    string_data = data.decode('utf-8')
    data_dict = json.loads(string_data)
    with open('details.txt', 'a') as f:
        json.dump(data_dict, f, ensure_ascii=False)
        f.write('\n')

    return {1: 'OK'}


@app.route('/next_registry', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_next_registry_to_scrape():
    last_page, last_row = get_last_detail_scraped()
    return get_next_registry(last_page, last_row)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=81, debug=True)
