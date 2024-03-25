#!/usr/bin/env python3
# -*- coding:utf-8 -*-

"""
# Project: lib
# FilePath: /parser_functions_new.py
# File: parser_functions_new.py
# Created Date: Sunday, March 17th 2024, 3:42:44 pm
# Author: Craig Bojko (craig@pixelventures.co.uk)
# -----
# Last Modified: Fri Mar 22 2024
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

PARENT_LIST_SELECTOR = 'div[jsname="bN97Pc"][role="list"]'
DATE_SELECTOR = 'hist-date-block'

LOG = True

def parse(html, videos, limit=False, max_videos=10, debug=False):
    """
    Main parsing function
    Loop all dates with content
    """
    global LOG

    item_number = 0
    current_date = ''

    LOG = LOG or debug

    log(f"HTML: {len(list(html.find('div', {'jsname': 'bN97Pc'}).children))}", 'cyan')
    log('---', 'grey')

    for item in html.find('div', {'jsname': 'bN97Pc'}).children:
        # get type of item
        item_type = item.name

        if item is None or item_type is None:
            continue
        item_number += 1
        if limit and len(videos) >= max_videos:
            log(f"Max videos reached: {max_videos}", 'red')
            break

        # print(colored('Encountered a DateBlock tag:', 'cyan'))
        log(f"ITEM PARSED: {item_number}: {item_type}", 'cyan')

        # Finds date from block - stores in scoped variable
        if item_type == 'div':
            for date in item.find_all('h2'):
                log(f"Date: {colored(date.get_text(), 'magenta')}")
                current_date = date.get_text()

        if item_type == 'c-wiz':
            # New object
            current_video = VideoView()

            data_date = parse_date_from_attr(item)
            log(f"DATE ATTR: {data_date}", 'magenta')

            if data_date and re.compile(r'\d{4}\d{2}\d{2}').match(data_date):
                log(f"Setting Video date to Data Date: {data_date}", 'magenta')
                current_video.set_date(data_date)
            else:
                current_video.set_date(current_date)

            # Get the title and link & compile id
            for element in item.find_all('div', attrs={'class': 'QTGV3c', 'jsname': 'r4nke'}):
                title = element.get_text().strip().replace('\n', '')

                title, link = resolve_title_link(element)
                current_video.set_name(title)
                current_video.set_link(link)
                log(f'Title: {title}', 'green')
                log(f'Link: {link}')

                video_id = resolve_id(link)
                if video_id:
                    current_video.set_videoId(video_id)

                # Resolve state of video item
                (is_watched,
                    is_searched,
                    is_removed,
                    is_private,
                 ) = resolve_state(element.get_text())
                log(f"State: W:{is_watched} S:{is_searched} R:{
                    is_removed} P:{is_private}", 'cyan')

            # Get time of play
            time = parse_time_of_play(item)
            current_video.set_time(time)
            log(f"Time: {time}", 'cyan')

            # Get the channel name
            channel = parse_channel_name(item)
            current_video.set_channel(channel)

            # Get the image and duration
            (image, duration) = parse_image_duration(item)
            current_video.set_image(image)
            current_video.set_duration(duration)
            log(f"Image: {image}", 'cyan')
            log(f"Duration: {duration}", 'cyan')

            # Set date and datetime
            (datetime, timestamp) = resolve_date_time(current_video)
            current_video.set_datetime(datetime)
            current_video.set_timestamp(timestamp)


            # Parsing complete for item - append to array
            hash_id = resolve_hash(current_video)
            current_video.set_hash(hash_id)

            # Finally - add to array
            videos.append(current_video)
            if LOG:
                current_video.print()
        log('---', 'grey')


def resolve_id(link):
    """ Compile video id from link """
    video_id = None
    id_regex = re.compile(r'watch\?v=([A-z0-9-]+)', re.I)
    id_regex_result = re.search(id_regex, link)
    video_id = id_regex_result.group(1) if id_regex_result else None
    return video_id


def resolve_state(title):
    """ Resolve state of video item """
    state = {
        'is_watched': 'watched' in title.lower(),
        'is_searched': 'searched' in title.lower(),
        'is_removed': 'removed' in title.lower(),
        'is_private': 'youtube.com/watch' in title.lower(),
    }

    _void = log('Removed: True', 'red') if state.get(
        'is_removed') else log('Removed: False')
    _void = log('Private: True', 'red') if state.get(
        'is_private') else log('Private: False')
    _void = log('Searched: True', 'yellow') if state.get(
        'is_searched') else log('Searched: False')
    _void = log('Watched: True', 'green') if state.get(
        'is_watched') else log('Watched: False')

    return (
        state.get('is_watched'),
        state.get('is_searched'),
        state.get('is_removed'),
        state.get('is_private'),
    )


def resolve_title_link(element):
    """ Resolve title and link from element """
    title = element.get_text().strip().replace('\n', '')
    link = ''
    if element.find('a') is not None:
        title = element.find('a').get_text().strip().replace('\n', '')
        title = re.sub(r'\s+', ' ', title)
        link = element.find('a').attrs['href']
    return (title, link)


def resolve_hash(video):
    """
    Compiles hash value for video item
    """
    _hash = ''
    _hash = hashlib.sha1()
    _hash.update((str(video.get_timestamp()) +
                 video.get_name() + video.get_link()).encode())
    return str(_hash.hexdigest())


def resolve_date_time(video):
    """ Compiles date and time for video item """
    dt_arr = convert_datetime(video)
    return (dt_arr[0], dt_arr[1])


def parse_date_from_attr(item):
    """ Parse the date from the attribute """
    date = item.attrs.get('data-date')
    return date


def parse_time_of_play(item):
    """ Parse the time of play """

    element = item.find('div', attrs={'class': 'wlgrwd', 'jsname': 'vjl09e'})
    if element is not None:
        time = element.get_text().strip().replace('\n', '')
        time = re.sub(r'\s+', ' ', time).replace(' • Details', '').strip()
        return time
    return None


def parse_channel_name(item):
    """ Parse the channel name """
    content_block = item.find(
        attrs={'class': re.compile('SiEggd')})
    details = None
    if content_block is not None:
        details = content_block.findChildren()

    if details is not None and len(details) > 0:
        channel = details[0].get_text().strip()
        return channel
    return None


def parse_image_duration(item):
    """ Parse the image and duration """
    extra = item.find_all(attrs={'class': "l8sGWb", 'jsname': "pMSZnb"})
    if extra is None or len(extra) == 0:
        return (None, None)

    extra = extra[0]

    image = extra.select('img')
    if (image is not None and len(image) > 0):
        image = image[0]
        image = image.attrs['src'] if image is not None else None
    else:
        image = None

    duration = extra.select('.bI9urf')
    if (duration is not None and len(duration) > 0):
        duration = duration[0]
        duration = duration.get_text().strip() if duration is not None else None
    else:
        duration = None
    return (image, duration)


def log(msg, color=None):
    """ Log a message to the console """
    if LOG is False:
        return
    if color:
        print(colored(f"{msg}", color))
    else:
        print(f"{msg}")
