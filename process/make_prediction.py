import prediction_utils
from collections import defaultdict
import numpy as np
from keras.utils import np_utils
from keras.preprocessing import sequence
import pandas as pd
import os
import sys

event_list_file = "../data/RNN_event_list.csv"
user_info_file = "../data/user_info.csv"
log_file = "../data/all_events.log"
ordered_log_file = "../data/ORDERED_" + log_file.split('/')[-1]
model_dir = "../model"
predictions_file = "../data/predictions.csv"

# Generate ordered event log
prediction_utils.generate_ordered_event_copy(log_file)

with open(ordered_log_file) as f:
	ordered_event_list = f.readlines()

# Generate dictionary of student to list of his/her actions sorted chronologically
student_sorted = prediction_utils.stusort(ordered_event_list)

# Generate dictionary of course event to integer encoding
ce_types = prediction_utils.get_ce_types(event_list_file)

# Generate dataframe of user and their corresponding chronological event sequence
event_stream_per_student = defaultdict(list)
for u_name, actions in student_sorted.items():
    for line in actions:
        try:
            parsed_event = prediction_utils.parse_event(line)
        except ValueError:
            print("Unable to parse:", line)
            continue
        time_element = line['time']
        username = line['username']
        if parsed_event in ce_types:
	        event_stream_per_student[u_name].append(ce_types[parsed_event])

events_df = pd.DataFrame({'username': list(event_stream_per_student.keys()), 'seq': list(event_stream_per_student.values())})

# For CS169, user action ceiling chosen as 7000 and |types of actions| == 88, models are trained on this
max_seq_len = 7000
max_input_dim = 88
events_df.reset_index(drop=True, inplace=True)
events_df.reindex(np.random.permutation(events_df.index))
event_list = events_df['seq'].values

event_list_binary = [np_utils.to_categorical(x, max_input_dim) for x in event_list]
x_train = sequence.pad_sequences(event_list_binary, maxlen=max_seq_len, dtype='int32',
                                     padding='post', truncating='post')

# Load model weights and get predictions
attr_model = prediction_utils.load_keras_weights_from_disk(model_dir, 'attr')
out = attr_model.predict(x_train)
prediction = out[:, -1, 0]
prediction = np.round(100 * prediction)
events_df['attrition_prediction'] = prediction

comp_model = prediction_utils.load_keras_weights_from_disk(model_dir, 'comp')
out2 = comp_model.predict(x_train)
prediction2 = out2[:, -1, 0]
prediction2 = np.round(100 * prediction2)
events_df['completion_prediction'] = prediction2

cert_model = prediction_utils.load_keras_weights_from_disk(model_dir, 'cert')
out3 = cert_model.predict(x_train)
prediction3 = out3[:, -1, 0]
prediction3 = np.round(100 * prediction3)
events_df['certification_prediction'] = prediction3

if not os.path.exists(user_info_file):
	raise Error("No username and email info")

# Enriches data with user information
user_info = pd.read_csv(user_info_file)
new_master_df = pd.merge(events_df, user_info, how='left', on='username')
new_master_df = new_master_df.dropna(axis=0, subset=['anon_user_id'])

header = ["anon_user_id", "attrition_prediction", "completion_prediction", "certification_prediction"]
new_master_df.to_csv(predictions_file, index=False, columns = header)
print("Updated predictions in data directory")
