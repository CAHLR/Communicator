DATE=`date --date="yesterday" +%Y-%m-%d`

# grab user info from aws
aws s3 cp s3://course-data/universityx-$DATE.zip ../data/
cd ../data
unzip -u universityx-$DATE.zip
gpg -d universityx-$DATE/UniversityX-CS999.2x-1T2017SP-auth_user-prod-analytics.sql.gpg > user.sql
rm -f universityx-$DATE.zip
