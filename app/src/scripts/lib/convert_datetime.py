#!/usr/bin/env python3
# -*- coding:utf-8 -*-

"""
# Project: lib
# FilePath: /convertDateTime.py
# File: convertDateTime.py
# Created Date: Friday, February 9th 2018, 1:57:26 pm
# Author: Craig Bojko (craig@pixelventures.co.uk)
# -----
# Last Modified: Fri Mar 22 2024
# Modified By: Craig Bojko
# -----
# Copyright (c) 2024 Pixel Ventures Ltd.
# ------------------------------------
# <<licensetext>>
"""

import datetime
import re
from typing import Dict
from termcolor import colored

from .video_view import VideoView

DATE_REGEX = re.compile(r'(\d+) ([A-Za-z]+) (\d+)')
DATE_REGEX_ISO = re.compile(r'\d{4}\d{2}\d{2}')
TIME_REGEX = re.compile(r'(\d+):(\d+)')
# DATE_REGEX = re.compile(r'([A-z]+)? (\d+)?(, \d+)?')
# TIME_REGEX = re.compile(r'(\d+)?:(\d+)? (AM|PM)?')

YESTERDAY_REGEX = re.compile(r'yesterday', re.I)
TODAY_REGEX = re.compile(r'today', re.I)

TODAY_OVERRIDE = 'March 16'  # False
YESTERDAY_OVERRIDE = 'March 15'  # False
YEAR_OVERRIDE = 2024 # datetime.datetime.now().year

months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
]

# Type definition for date dictionary
type DateDict = Dict[str, int]


def convert_datetime(video: VideoView):
    """
    Converts a given datetime object to a formatted date-time string and timestamp.
    """

    # global DATE_REGEX, TIME_REGEX
    date_time = ''
    timestamp = ''

    # Default date time dict
    dt_dict: DateDict = {
        'year': 0,
        'month': 0,  # This can be a string or an integer
        'date': 0,
        'hour': 0,
        'minute': 0
    }
    month_str = ''

    d = video.get_date()
    t = video.get_time()
    date_match = DATE_REGEX.match(d)
    date_match_iso = DATE_REGEX_ISO.match(d)
    time_match = TIME_REGEX.match(t)
    yesterday_match = YESTERDAY_REGEX.match(d)
    today_match = TODAY_REGEX.match(d)

    if today_match is not None:
        # print(colored('Today matched', 'yellow'), d)
        date_match = DATE_REGEX.match(TODAY_OVERRIDE)

    if yesterday_match is not None:
        # print(colored('Yesterday matched', 'yellow'), d)
        if YESTERDAY_OVERRIDE is not False:
            # TODO: work out the date
            date_match = DATE_REGEX.match(YESTERDAY_OVERRIDE)
        else:
            date_match = DATE_REGEX.match(YESTERDAY_OVERRIDE)

    # Start calculating date/times
    if date_match is not None:
        # print(date_match.groups())
        # dt_dict['month'] = date_match.group(1)
        month_str = date_match.group(2)
        dt_dict['date'] = int(date_match.group(1))

        # Handle current year - number is not supplied in html
        if date_match.group(3) is None:
            # TODO: work out the year
            dt_dict['year'] = YEAR_OVERRIDE
        else:
            dt_dict['year'] = int(date_match.group(3))

        # Determine month number from name
        for index, month in enumerate(months):
            if month.lower().find(str(date_match.group(2)).lower()) != -1:
                dt_dict['month'] = index + 1
    elif date_match_iso is not None:
        # print(date_match_iso.group())
        dt_dict['year'] = int(date_match_iso.group()[:4])
        dt_dict['month'] = int(date_match_iso.group()[4:6])
        dt_dict['date'] = int(date_match_iso.group()[6:8])

    if time_match is not None:
        # print(time_match.groups())
        dt_dict['hour'] = int(time_match.group(1))
        dt_dict['minute'] = int(time_match.group(2))

        # Handle 24hr offset
        # if (dt_dict['hour'] < 12 and str(time_match.group(3)) == 'PM'):
        #     dt_dict['hour'] = dt_dict['hour'] + 12

    # print(dt_dict)
    date_time = datetime.datetime(
        int(dt_dict['year']),
        int(dt_dict['month']),
        int(dt_dict['date']),
        int(dt_dict['hour']),
        int(dt_dict['minute'])
    )
    # print(date_time)
    if date_time is not None:
        timestamp = str((date_time.timestamp()) * 1000)[:-2]
        date_time = date_time.isoformat() + '.000Z'
    return [date_time, timestamp]
