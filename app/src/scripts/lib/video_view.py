#!/usr/bin/env python3
# -*- coding:utf-8 -*-

"""
# Project: lib
# FilePath: /video_view.py
# File: video_view.py
# Created Date: Thursday, February 1st 2018, 11:43:05 am
# Author: Craig Bojko (craig@pixelventures.co.uk)
# -----
# Last Modified: Fri Mar 22 2024
# Modified By: Craig Bojko
# -----
# Copyright (c) 2024 Pixel Ventures Ltd.
# ------------------------------------
# <<licensetext>>
"""

from termcolor import colored

class VideoView():
    """
    VideoView class
    """

    def __init__(self):
        self.hash = ''
        self.name = ''
        self.link = ''
        self.video_id = ''
        self.channel = ''
        self.duration = ''
        self.image = ''
        self.date = ''
        self.time = ''
        self.datetime = ''
        self.timestamp = ''

    # @property
    # def my_attribute(self):
    #     # Do something if you want
    #     return self._my_attribute

    # @my_attribute.setter
    # def my_attribute(self, value):
    #     # Do something if you want
    #     self._my_attribute = value

    def set_hash(self, h):
        """ Set the hash value for the video item """
        self.hash = h

    def get_hash(self):
        """ Returns the hash value for the video item """
        if self.hash is not None:
            return self.hash
        else:
            return ''

    def set_name(self, n):
        """ Set the name of the video item """
        self.name = n

    def get_name(self):
        """ Returns the name of the video item """
        if self.name is not None:
            return self.name
        else:
            return ''

    def set_link(self, l):
        """ Set the link of the video item """
        self.link = l

    def get_link(self):
        """ Returns the link of the video item """
        if self.link is not None:
            return self.link
        else:
            return ''

    def set_videoId(self, id):
        """ Set the videoId of the video item """
        self.video_id = id

    def get_videoId(self):
        """ Returns the videoId of the video item """
        if self.video_id is not None:
            return self.video_id
        else:
            return ''

    def set_channel(self, c):
        """ Set the channel name of the video item """
        self.channel = c

    def get_channel(self):
        """ Returns the channel name of the video item """
        if self.channel is not None:
            return self.channel
        else:
            return ''

    def set_date(self, d):
        """ Set the date of the video item """
        self.date = d

    def get_date(self):
        """ Returns the date of the video item"""
        if self.date is not None:
            return self.date
        else:
            return ''

    def set_duration(self, d):
        """ Set the duration of the video item """
        self.duration = d

    def get_duration(self):
        """ Returns the duration of the video item """
        if self.duration is not None:
            return self.duration
        else:
            return ''

    def set_image(self, i):
        """ Set the image of the video item """
        self.image = i

    def get_image(self):
        """ Returns the image of the video item """
        if self.image is not None:
            return self.image
        else:
            return ''

    def set_time(self, t):
        """ Set the time of the video item """
        self.time = t

    def get_time(self):
        """ Returns the time of the video item """
        if self.time is not None:
            return self.time
        else:
            return ''

    def set_datetime(self, t):
        """ Set the datetime as a string"""
        self.datetime = t

    def get_datetime(self):
        """Returns the datetime as a string"""
        if self.datetime is not None:
            return self.datetime
        else:
            return ''

    def set_timestamp(self, t):
        """ Timestamp is an integer"""
        self.timestamp = t

    def get_timestamp(self):
        """Returns the timestamp"""
        if self.timestamp is not None:
            return self.timestamp
        else:
            return ''

    def print(self):
        """ Print the video item to the console """
        print(colored('** -------------------------- **', 'green'))
        msg = str(colored('|  HASH: ', 'green') + self.get_hash()) + \
            str(colored('\n|  NAME: ', 'green') + self.get_name()) + \
            str(colored('\n|  VideoId: ', 'green') + self.get_videoId()) + \
            str(colored('\n|  Date: ', 'green') + self.get_date()) + \
            str(colored('\n|  Time: ', 'green') + self.get_time()) + \
            str(colored('\n|  DateTime: ', 'green') + str(self.get_datetime())) + \
            str(colored('\n|  Timestamp: ', 'green') + str(self.get_timestamp())) + \
            str(colored('\n|  Duration: ', 'green') + self.get_duration()) + \
            str(colored('\n|  Image: ', 'green') + self.get_image()) + \
            str(colored('\n|  Channel: ', 'green') + self.get_channel()) + \
            str(colored('\n|  Link: ', 'green') + self.get_link())
        print(msg)
        print(colored('** -------------------------- **', 'green'))
        return msg
