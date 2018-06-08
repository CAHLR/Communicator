#!/bin/sh

export server=your-server-here
export user=../data/user_info.csv
export pred=../data/predictions.csv
export un=your-secret-username # (must match with cross_main.js)
export pw=your-secret-password # (must match with cross_main.js)
export emailMode=mailgun-or-email
export emailUser=your-email-username
export emailPass=your-email-pass
export smtp=your-smtp@email.com
export mailgunLogin=your-mailgun-login # called the Default SMTP Login
export mailgunPass=your-mailgun-password # called the Default Password
export httpsDir=path-to-dir # directory where all the certs are
export pkey=name-of-pkey
export pcert=name-of-pcert
export bundle=name-of-bundle-cert
export port=your-server-port # port of your backend server (must match with client_main.js)
export mongoPort=your-mongo-port # port of your mongodb
export emailCode=your-email-code # prevents malicious email attempts (must match with client_main.js)

while [ 1 ];do
sh daily.sh
if [ `date --date="yesterday" +%w` = 0 ]
then
  sh weekly.sh
  cd ../process
  python make_user_info.py
fi

cd ../process
cuda make_prediction.py
cd ../scripts
python automated.py
sleep 24h
done
