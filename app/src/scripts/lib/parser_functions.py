#!/usr/bin/env python3
# -*- coding:utf-8 -*-

"""
# Project: lib
# FilePath: /parser_functions.py
# File: parser_functions.py
# Created Date: Friday, February 9th 2018, 12:38:49 pm
# Author: Craig Bojko (craig@pixelventures.co.uk)
# -----
# Last Modified: Sun Mar 17 2024
# Modified By: Craig Bojko
# -----
# Copyright (c) 2024 Pixel Ventures Ltd.
# ------------------------------------
# <<licensetext>>
"""

import re
import hashlib
from termcolor import colored

from lib.video_view import VideoView
from .convert_datetime import convert_datetime

def parse(html, videos, limit=False, max_videos=10):
    """
    Main parsing function
    Loop all dates with content
    """
    for hist in html.find_all(['hist-date-block']) or []:
        if limit and len(videos) >= max_videos:
            print(colored('Max videos reached:', 'red'), max_videos)
            break

        print(colored('Encountered a DateBlock tag:', 'cyan'))

        # Finds date from block - stores in scoped variable
        for date in hist.find_all('h2'):
            print('Date: ', colored(date.get_text(), 'magenta'))
            current_date = date.get_text()

        # Loops date block items...
        for card in hist.find_all('hist-display-item'):
            # New object
            current_video = VideoView()

            # Get the title and link & compile id
            for title in card.find_all(attrs={'class': re.compile('fp-display-block-title')}):
                compile_name_link(current_video, title)
                compile_id(current_video)

            # Get time of play
            parse_time_of_play(current_video, card, current_date)

            # Get the channel name
            parse_channel_name(current_video, card)

            # Get the image and duration
            parse_image_duration(current_video, card)

            # Set date and datetime
            compile_date_time(current_video)

            # Parsing complete for item - append to array
            compile_hash(current_video)

            # Finally - add to array
            videos.append(current_video)


def compile_id(video):
    video_id = ''
    id_regex = re.compile(r'watch\?v=([A-z0-9-]+)', re.I)
    id_regex_result = re.search(id_regex, video.get_link())
    print('ID Regex: ', id_regex_result)
    if id_regex_result:
        video_id = id_regex_result.group(1)
    if video_id:
        video.set_videoId(video_id)
    else:
        video.set_videoId('searchquery')
    print('VideoID: ', video_id)


def compile_name_link(video, title):
    _name = title.select('a')[0]
    name = _name.get_text().strip()
    link = _name.attrs['href']
    print(colored('Title: ', 'green'), name)
    print('Link: ', link)
    video.set_name(name)
    video.set_link(link)


def compile_hash(video):
    """
    Compiles hash value for video item
    """
    _hash = ''
    _hash = hashlib.sha1()
    _hash.update((str(video.get_timestamp()) + video.get_name() + video.get_link()).encode())
    video.set_hash(str(_hash.hexdigest()))
    print('Hash: ', _hash)


def compile_date_time(video):
    dt_arr = convert_datetime(video)
    video.set_datetime(dt_arr[0])
    video.set_timestamp(dt_arr[1])
    print('DT: ', dt_arr[0])
    print('TS: ', dt_arr[1])


def parse_time_of_play(video, html, current_date):
    block_details = html.find(attrs={'class': re.compile('fp-display-block-details')})
    details = None
    if block_details is not None:
        details = block_details.findChildren()

    if details is not None and len(details) > 0:
        details_time = details[0].get_text().strip()
        video.set_time(details_time)
        video.set_date(current_date)


def parse_channel_name(video, html):
    content_block = html.find(attrs={'class': re.compile('fp-display-block-content')})
    details = None
    if content_block is not None:
        details = content_block.findChildren()

    if details is not None and len(details) > 0:
        channel = details[0].get_text().strip()
        video.set_channel(channel)
        print('Channel: ', channel)


def parse_image_duration(video, html):
    extra = html.find_all(
        attrs={'class': re.compile('fp-display-block-video')})[0]
    image = extra.select('img')[0]
    duration = extra.select('.fp-display-item-yt-duration')[0]
    video.set_image(image.attrs['src'])
    video.set_duration(duration.get_text().strip())
    print('Image: ', image.attrs['src'])
    print('Duration: ', duration.get_text().strip())
