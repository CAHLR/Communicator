import pandas as pd
import numpy as np

student_details_file = "../data/user.sql"
user_info_file = "../data/user_info.csv"

student_details = pd.DataFrame(pd.read_table(student_details_file))
student_details = student_details.loc[:,['first_name','last_name', 'id','username','email']]
student_details = student_details.drop_duplicates().reset_index(drop=True)
first_name = student_details.first_name.tolist()
last_name = student_details.last_name.tolist()
details_actual_user_id = student_details.id.tolist()
username = student_details.username.tolist()
email = student_details.email.tolist()
new_df = pd.DataFrame({'first_name': first_name, 'last_name': last_name, 'actual_user_id': details_actual_user_id, 'username': username, 'email': email})
new_df["anon_user_id"] = np.nan

previous_anon_value = 0
try:
    old_user_df = pd.read_csv(user_info_file)
    updated_df = pd.concat([old_user_df, new_df], sort=False, ignore_index=True).drop_duplicates('username')
    previous_anon_value  = int(len(old_user_df))
except Exception as e:
    print(e)
    updated_df = new_df

for index, row in updated_df.loc[updated_df['anon_user_id'].isnull()].iterrows():
    updated_df.iloc[index,-1] = previous_anon_value
    previous_anon_value +=1

updated_df.to_csv(user_info_file, index=False, header=['actual_user_id','email','first_name','last_name','username', 'anon_user_id'])
print ("Updated User Info")
