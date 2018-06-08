import csv
import json
import sys
import getopt
import pprint
import os
import requests
from pymongo import MongoClient
import pandas as pd

server = os.environ["server"]
port = os.environ["port"]
mongoPort = os.environ["mongoPort"]
emailCode = os.environ["emailCode"]

url = "https://" + server + ":" + port + "/api/email"
headers = {'Content-Type': 'application/json', 'Accept':'application/json'}

mongo_client = MongoClient(host="localhost", port=int(mongoPort))
db_pred = mongo_client.predictions
db_pred.pred.drop()

# Adding csv to mongo
predictions = os.environ["pred"]
with open(predictions, "r") as csvfile:
    reader = csv.DictReader(csvfile)
    header= ['anon_user_id', 'attrition_prediction', 'completion_prediction', 'certification_prediction']

    for data in reader:
        row = {}
        for field in header:
            if field != "anon_user_id":
                row[field]= float(data[field])
            else:
                row[field]=data[field]

        db_pred.pred.insert(row)

db_policy = mongo_client.policies
cursor = db_policy.policies.find({"analytics": "true", "auto": "true"})

for p in cursor:
    print(p['subject'])
    old_ids = p['ids']

    attr_low = float(p['attr'][0])
    attr_high = float(p['attr'][1])
    comp_low = float(p['comp'][0])
    comp_high = float(p['comp'][1])
    cert_low = float(p['cert'][0])
    cert_high = float(p['cert'][1])
    print(attr_low, attr_high, comp_low, comp_high, cert_low, cert_high)

    new_ids = db_pred.pred.find(
    {"$and":
        [
            {"$and": [{"attrition_prediction": { "$gte": attr_low }}, {"attrition_prediction": { "$lte": attr_high }}]},
            {"$and": [{"completion_prediction": { "$gte": comp_low }}, {"completion_prediction": { "$lte": comp_high }}]},
            {"$and": [{"certification_prediction": { "$gte": cert_low }}, {"certification_prediction": { "$lte": cert_high }}]}
        ]
    })

    for i in new_ids:
        if i['anon_user_id'] not in old_ids:
            print(i)
            updated = old_ids + [i['anon_user_id']]
            db_policy.policies.find_one_and_update({"_id": p['_id']}, {"$set": {"ids":updated}})
            data_to_send = {"pass": emailCode, "ids": [i['anon_user_id']], "body": p['body'], "subject": p['subject'], "reply": p['reply'], "from": p['from']}
            r = requests.post(url, data=json.dumps(data_to_send), headers=headers)
