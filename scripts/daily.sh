DATE=`date --date="yesterday" +%Y-%m-%d`
echo $DATE
CLASS='course-v1:UniversityX+CS999.2x+1T2017SP'

# grab event log from aws
aws s3 cp s3://edx-course-data/universityx/edx/events/`date +%Y`/events-$DATE.log.gz.gpg ../data/
cd ../data
gpg -d events-$DATE.log.gz.gpg|gunzip - |grep $CLASS > events_$DATE.log
rm -f *.gpg
cat events.log >> all_events.log
