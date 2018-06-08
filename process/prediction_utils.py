from collections import defaultdict
import json
from datetime import timedelta
import datetime
import re
import pandas as pd
import numpy as np
import pickle
import glob
import os
import xml.etree.ElementTree as ET
from keras.utils import np_utils
from keras.preprocessing import sequence
from keras.models import Sequential, model_from_json
from keras.layers import Dense, LSTM, Activation, Masking
from keras.layers.wrappers import TimeDistributed

def generate_ordered_event_copy(log_file):
    """
    INPUT: path to event log file (one action per row)
    OUTPUT: orders the actions by time, and then writes a new file.
            New file will be placed in current directory with the name ORDERED_ + log_file
    """
    output_name = "../data/ORDERED_" + log_file.split('/')[-1]
    all_data_paired_with_time = []
    with open(log_file) as data_file:
        for line in data_file.readlines():
            try:
                data = json.loads(line)
            except:
                print(line)
                continue
            time_element = data['time']
            if '.' in time_element:
                date_object = datetime.datetime.strptime(time_element[:-6], '%Y-%m-%dT%H:%M:%S.%f')
            else:
                date_object = datetime.datetime.strptime(time_element[:-6], '%Y-%m-%dT%H:%M:%S')
            all_data_paired_with_time.append((line, date_object))

    print('sorting by time')
    s = sorted(all_data_paired_with_time, key=lambda p: p[1])
    to_output = [pair[0] for pair in s]

    print("writing to:",output_name)
    with open(output_name, mode='w') as f:
        for line in to_output:
            f.write(line)

    print("writing complete")

def stusort(ordered_event_list):
    """
    INPUT: path to ordered event log file
    OUTPUT: group time-sorted data by student {'stuX':[dict_time0, dict_time3, dict_time4], 'stuY':[dict_time1, dict_time2], ...}
    NOTE: events in returned dict are aggregated across weeks, within [course_start, uppertimelim], across all students in dictionary
    """
    student_sorted = {}
    for i in ordered_event_list:
        i = json.loads(i)
        # limit by week:
        messytime = i['time'].split('+')[0]
        cleantime = datetime.datetime.strptime(messytime, '%Y-%m-%dT%H:%M:%S.%f' if '.' in messytime else '%Y-%m-%dT%H:%M:%S')
        tmp_id = i['username']
        if tmp_id in student_sorted:
            student_sorted[tmp_id].append(i)
        else:
            student_sorted[tmp_id] = [i]
    return student_sorted

def get_ce_types(event_list_file):
    """
    INPUT: event list file (RNN_event_list.csv)
    OUTPUT: dictionary with integer encodings of event types
    """
    if not os.path.exists(event_list_file):
        raise Error("No list of RNN Events")

    with open(event_list_file) as f:
        event_list = f.read().splitlines()
    return {etype: i for i, etype in enumerate(event_list)}

def parse_event(data):
    """
    INPUT: row of individual action event
    OUTPUT: the event type it corresponds to
    """
    try:
        event_type = data['event_type']
        if re.match(r"/courses/.+/courseware/", event_type):
            parsed_event = 'courseware_load'
        elif re.match(r"/courses/.+/jump_to_id/[^/]+/?$", event_type):
            parsed_event = "jump_to_id"
        elif re.match(r"/courses/.+/$", event_type):
            parsed_event = 'homepage'
        elif re.match(r"/courses/.+/discussion/users$", event_type):
            parsed_event = 'view users'
        elif re.match(r"/courses/.+/about$", event_type):
            parsed_event = 'about page'
        elif re.match(r"/courses/.+/course_wiki$", event_type):
            parsed_event = 'wiki homepage'
        elif re.match(r"/courses/.+/discussion/forum/?$", event_type):
            parsed_event = "forum homepage"
        elif re.match(r"/courses/.+/info/$", event_type):
            parsed_event = "course info"
        elif re.match(r"/courses/.+/discussion/[^/]+/threads/create$", event_type):
            parsed_event = 'create discussion'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/reply$", event_type):
            parsed_event = 'reply discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/flagAbuse$", event_type):
            parsed_event = 'flag abuse discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/unFlagAbuse$", event_type):
            parsed_event = 'unflag abuse discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/delete$", event_type):
            parsed_event = 'delete discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/upvote$", event_type):
            parsed_event = 'upvote discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/update$", event_type):
            parsed_event = 'update discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/unvote$", event_type):
            parsed_event = 'unvote discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+/endorse$", event_type):
            parsed_event = 'endorse discussion comment'
        elif re.match(r"/courses/.+/discussion/comments/[^/]+$", event_type):
            parsed_event = 'load discussion comment'
        elif re.match(r"/courses/.+/discussion/forum/[^/]+/inline$", event_type):
            parsed_event = 'inline discussion'
        elif re.match(r"/courses/.+/discussion/forum/[^/]+/threads/[^/]+", event_type):
            parsed_event = 'thread discussion'
        elif re.match(r"/courses/.+/discussion/[^/]+/threads/create$", event_type):
            parsed_event = 'create thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/follow$", event_type):
            parsed_event = 'follow thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/unfollow$", event_type):
            parsed_event = 'unfollow thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/reply$", event_type):
            parsed_event = 'reply thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/upvote$", event_type):
            parsed_event = 'upvote thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/unvote$", event_type):
            parsed_event = 'unvote thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/threads/delete$", event_type):
            parsed_event = 'delete thread2 discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/follow$", event_type):
            parsed_event = 'follow thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/unfollow$", event_type):
            parsed_event = 'unfollow thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/reply$", event_type):
            parsed_event = 'reply thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/upvote$", event_type):
            parsed_event = 'upvote thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/unvote$", event_type):
            parsed_event = 'unvote thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/delete$", event_type):
            parsed_event = 'delete thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/update$", event_type):
            parsed_event = 'update thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/pin$", event_type):
            parsed_event = 'pin thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/unpin$", event_type):
            parsed_event = 'unpin thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/flagAbuse$", event_type):
            parsed_event = 'flag abuse thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/unFlagAbuse$", event_type):
            parsed_event = 'delete thread discussion'
        elif re.match(r"/courses/.+/discussion/threads/[^/]+/close$", event_type):
            parsed_event = 'close thread discussion'
        elif re.match(r"/courses/.+/discussion/upload", event_type):
            parsed_event = 'upload to discussion'
        elif re.match(r'/courses/.+/info', event_type):
            parsed_event = 'info page'
        elif re.match(r'/courses/.+/pdfbook/', event_type):
            parsed_event = 'pdf book'
        elif re.match(r'/courses/.+/progress', event_type):
            parsed_event = 'progress page'
        elif re.match(r"/courses/.+/wiki/.*", event_type):
            parsed_event = 'wiki page'
        else:
            parsed_event = event_type
        # check for correct or incorrect problem_check
        if parsed_event == "problem_check":
            try:
                if data["event"]["success"] == "correct":
                    parsed_event = 'problem_check_correct'
                else:
                     parsed_event = 'problem_check_incorrect'
            except:
                parsed_event = 'problem_check_incorrect'
        return parsed_event
    except:
        print ("Found this event for the first time, skipping it for now")
        pass

def load_keras_weights_from_disk(directory, model_name):
    """
    INPUT: path to the model directory AND what model (attr, comp, cert)
    OUTPUT: keras model with the respective architecture and weights
    """
    with open(directory + "/" + model_name + ".json", 'r') as json_file:
        keras_model = model_from_json(json_file.readline())
    keras_model.load_weights(directory + "/" + model_name + "_weights.h5")
    keras_model.compile(loss='binary_crossentropy', optimizer='RMSprop', metrics=['accuracy'])
    return keras_model
