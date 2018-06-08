# Related Paper
Le. C.V., Pardos, Z.A., Meyer, S.D., Thorp, R. (in-press) Communication at Scale in a MOOC Using Predictive Engagement Analytics. To appear in Proceedings of the 19th International Conference on Artificial Intelligence in Education (AIED). London, UK. [pdf](http://people.ischool.berkeley.edu/~zp/papers/AIED_communication_at_scale.pdf)

## Getting Started

0. Clone the repo and run `npm install`
1. Fill out **scripts/startup.sh**
2. Match **frontend/client_main.js** and **frontend/cross_main.js** with the info from the startup file
3. Upload `client_main.js`, `cross_main.js`, `crossfilter.js`, `d3.js`, and `styles.css` to edX
  * Click *Files & Uploads* which is under the *Content* dropdown at the top of the page in the vertical studio editor
4. Insert a **Raw HTML Block**
5. Copy and paste `client.html` into the block
6. Change **scripts/weekly.sh** paths to the proper locations and then run to get the user roster
7. Run **process/make_user_info.py** which uses the roster to get the **user_info.csv** file and places it in the **data** directory
8. Change **scripts/daily.sh** paths to the proper locations and then run to get yesterday's event log
9. Run **process/make_prediction.py** which uses the event log to get the **predictions.csv** file and places it in the **data** directory

> The startup script will automatically pull down from edX the roster on a weekly basis and create **user_info.csv** file. It will also pull down from edX the event log on a daily basis and create a **predictions.csv** file, which will be anonymized.

## Backend

1. `user_info` path and `predictions` path can be changed in **scripts/startup.sh**
2. `secretUsername` and `secretPassword` from **server.js** need to be copied to **frontend/cross_main.js**. This is to ensure that only you can receive the predictions info, which just in case is also anonymized.
3. Set the `emailUsername`, `emailPassword`, and `smtp` if you choose not to masquerade and use a mail service like MailGun.
4. Change `pkey`, `pcert`, `cert` with the correct paths to enable HTTPS (required for edX)
5. Set the port for the server and make sure it matches with **frontend/client_main.js**
6. Start the mongo database on a different screen
  > mongod --dbpath=db_data --port=1301
7. Launch with `node server.js`

## Data

* `RNN_event_list.csv`: A list with all the relevant event types
* `all_events.log`: A continually concatenated list that has all user events in the course. Created by **scripts/daily.sh** which is run by **scripts/startup.sh**
* `user.sql`: A sql file of all the users in the system for the most recent week. Created by **scripts/weekly.sh** which is run by **scripts/startup.sh**
* `user_info.csv`: File of all the up to date user info. Created by **process/make_user_info.py**
* `prediction.csv`: File of the predictions of completion, attrition, and certification for anonymized users. Created by **process/make_prediction.py**

## Frontend

1. Upload `client_main.js`, `cross_main.js`, `crossfilter.js`, `d3.js`, and `styles.css` to edX
  * Click *Files & Uploads* which is under the *Content* dropdown at the top of the page in the vertical studio editor
2. Insert a **Raw HTML Block**
3. Copy and paste `client.html` into the block

## Model

Architecture and weights for the three trained models used to predict attrition, certification, and completion.

## Process

1. Must run `python make_user_info.py` before `python make_prediction.py`
  * `prediction_utils`: Various utility functions that allow `make_prediction.py` to work

## Scripts

* `automated.py`: Checks if any new students meet policies that has been designated with "automatic check"
* `daily.sh`: Grabs the event log file from AWS
* `weekly.sh`: Grabs the user file from AWS
* `startup.sh`: Does the following:
    - Sets the path for *prediction* and *user_info* files
    - Runs `daily.sh` + `automated.py` + `make_prediction.py` to update `predictions.csv` daily
    - Runs `weekly.sh` and `make_user_info.py` to update `user_info.csv` weekly
