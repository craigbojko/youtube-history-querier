#!/usr/bin/env python3
from termcolor import colored


class VideoView():

    def __init__(self):
        self.name = ''
        self.link = ''
        self.channel = ''
        self.duration = ''
        self.date = ''
        self.time = ''

    def setName(self, n):
        self.name = n

    def getName(self):
        if (self.name is not None):
            return self.name
        else:
            return ''

    def setLink(self, l):
        self.link = l

    def getLink(self):
        if (self.link is not None):
            return self.link
        else:
            return ''

    def setChannel(self, c):
        self.channel = c

    def getChannel(self):
        if (self.channel is not None):
            return self.channel
        else:
            return ''

    def setDate(self, d):
        self.date = d

    def getDate(self):
        if (self.date is not None):
            return self.date
        else:
            return ''

    def setDuration(self, d):
        self.duration = d

    def getDuration(self):
        if (self.duration is not None):
            return self.duration
        else:
            return ''

    def setTime(self, t):
        self.time = t

    def getTime(self):
        if (self.time is not None):
            return self.time
        else:
            return ''

    def printContent(self):
        msg = str(colored('NAME: ', 'green') + self.getName()) + \
            str(colored('\nDate: ', 'green') + self.getDate()) + \
            str(colored('\nTime: ', 'green') + self.getTime()) + \
            str(colored('\nDuration: ', 'green') + self.getDuration()) + \
            str(colored('\nChannel: ', 'green') + self.getChannel()) + \
            str(colored('\nLink: ', 'green') + self.getLink())
        print('** -------------------------- **')
        print(msg)
        print('** -------------------------- **')
        return msg
