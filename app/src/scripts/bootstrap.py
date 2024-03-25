#!/usr/bin/env python3
# -*- coding:utf-8 -*-
###
# FileName: bootstrap.py
# FilePath: /Volumes/Data/Craig/Resilio/Sites/Personal/Projects/youtube-history/app/src/scripts/bootstrap.py
# Project: /Volumes/Data/Craig/Resilio/Sites/Personal/Projects/youtube-history/app/src/scripts
# Created Date: Wednesday, January 31st 2018, 9:57:50 am
# Author: Craig Bojko
# -----
# Last Modified: Fri Feb 09 2018
# Modified By: Craig Bojko
# -----
# Copyright (c) 2018 Pixel Ventures Ltd.
# ------------------------------------
###

"""
Python parser for Google my-activity HTML dump
"""

import importlib
import pprint

from datetime import datetime
from termcolor import colored
from bs4 import BeautifulSoup
from pymongo import MongoClient

MONGO_URI = 'mongodb://admin:password@localhost:27017/'
VIDEOS = []
PP = pprint.PrettyPrinter(indent=4)

# Flags
DB_INSERT = True
DEBUG = False
LIMIT = False
MAX_VIDEOS = 100
HTML_VERSION = 2 # 1 = old, 2 = new
# FILENAME = 'test7.activity-new.html'
# FILENAME = 'google_activity-origin-aug2016.activity.html'

FILENAMES = [
    '../../../html-source/1_1-1-23_16-3-24.html'
    '../../../html-source/2_1-1-22_1-1-23.html',
    '../../../html-source/3_1-1-21_1-1-22.html',
    '../../../html-source/4_1-1-20_1-1-21.html',
    '../../../html-source/5_1-1-18_1-1-20.html',
    '../../../html-source/6_1-1-16_1-1-18.html',
    '../../../html-source/7_1-1-14_1-1-16.html',
    '../../../html-source/8_1-1-12_1-1-14.html',
    '../../../html-source/9_1-1-10_1-1-12.html',
]

"""
Parser functions
- Import the correct parser functions based on the HTML_VERSION flag
"""
PARSER_LIB = 'lib.parser_functions'
if HTML_VERSION == 2:
    PARSER_LIB = 'lib.parser_functions_new'
parser = importlib.import_module(PARSER_LIB)

def main():
    """
    Main init function
    """
    start = datetime.now()

    for FILENAME in FILENAMES:
        with open(FILENAME, 'r', encoding="utf-8") as file:
            # page = [line.decode('utf-8').strip() for line in file.readlines()]
            page = file.read()

        html = BeautifulSoup(page, "html.parser")
        parser.parse(html, VIDEOS, limit=LIMIT, max_videos=MAX_VIDEOS, debug=DEBUG)

    # Connect MongoDB
    client = MongoClient(MONGO_URI)
    database = client.youtube_history

    count_success = 0
    count_update = 0
    count_fail = 0

    if DB_INSERT is True:
        for index, video in enumerate(VIDEOS):
            print('INDEX: ', index)
            video.print()
            print(colored('---', 'grey'))
            result = database.history.update_one(
                {"hash": video.get_hash()},
                {"$set": video.__dict__},
                upsert=True
            )
            print(str(result))
            print(colored('---\n', 'grey'))

            if result.upserted_id is not None:
                count_success += 1
            elif result.modified_count > 0 or result.matched_count > 0:
                count_update += 1
            else:
                count_fail += 1

    end = datetime.now()
    print(colored('TOTAL SUCCESS INSERTS:::', 'magenta'), count_success)
    print(colored('TOTAL UPDATE INSERTS:::', 'magenta'), count_update)
    print(colored('TOTAL FAIL INSERTS:::', 'magenta'), count_fail)
    print(colored('TOTAL VIDEO VIEWS:::', 'magenta'), len(VIDEOS))

    time_diff = end - start
    time_diff_in_seconds = time_diff.total_seconds()
    print(colored('END TIME DIFF:::', 'magenta'), f'{time_diff_in_seconds:.3f} seconds')


if __name__ == '__main__':
    main()
