#!/usr/bin/env python3
""".

Python parser for Google myactivity HTML dump

"""

from html.parser import HTMLParser
from classes.VideoView import VideoView
from termcolor import colored
from pymongo import MongoClient
import datetime
import time
import re
import hashlib

videoViews = []
currView = None
currAttrs = None
dataRow = False
currDate = ''

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


class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        global currView, currAttrs, dataRow
        # print("TAG:: ", tag)

        if (tag == 'md-card-content'):
            currView = VideoView()
            dataRow = False
            #  print(colored('Encountered a start tag:', 'cyan'), tag)
        elif (tag == 'a'):
            #  print(colored('Encountered a start tag:', 'cyan'), tag)
            c = False
            currAttrs = attrs
            for attr in attrs:
                if (attr[0] == 'class'):
                    c = True
                #  elif (attr[0] == 'href'):
                    #  print(colored('Encountered a href:', 'cyan'), attr[1])
            if c is False:
                dataRow = 1
        elif (tag == 'h2'):
            #  print(colored('Encountered a start tag:', 'cyan'), tag)
            for attr in attrs:
                if (attr[0] == 'class' and attr[1] != '' and attr[1].find('fp-date-block-date') != -1):
                    dataRow = 2
        elif (tag == 'div'):
            #  print(colored('Encountered a start tag:', 'cyan'), tag)
            currAttrs = attrs
            for attr in attrs:
                if (attr[0] == 'class' and attr[1] != '' and attr[1].find('fp-display-item-yt-duration') != -1):
                    dataRow = 3
                elif (attr[0] == 'class' and attr[1] != '' and attr[1].find('fp-display-block-yt-channel') != -1):
                    dataRow = 4
        elif (tag == 'span'):
            #  print(colored('Encountered a start tag:', 'cyan'), tag)
            for attr in attrs:
                if (attr[0] == 'ng-if' and attr[1] != '' and attr[1].find('::!summaryItem') != -1):
                    dataRow = 5
        elif (tag == 'img'):
            for attr in attrs:
                if (attr[0] == 'src' and attr[1] != '' and attr[1].find('ytimg') != -1):
                    currView.setImage(attr[1])
        else:
            dataRow = False

    def handle_endtag(self, tag):
        global currView, dataRow, videoViews
        if (tag is not None
                and tag != '' and
                tag == 'md-card-content' or tag == 'a'):
            dataRow = False
            #  print(colored('Encountered an end tag:', 'red'), tag)
        if (tag == 'md-card-content' and currView.getName() != ''):
            videoViews.append(currView)
            #  currView.printContent()

    def handle_data(self, data):
        global currView, currAttrs, dataRow, currDate
        if (dataRow is not None
                and dataRow is not False
                and data is not None
                and data != ''):
            if (dataRow is 1):
                currView.setName(data.strip())
                currView.setDate(currDate.strip())
                for attr in currAttrs:
                    if (attr[0] == 'href' and attr[1] != ''):
                        currView.setLink(attr[1])
                dataRow = False
                currAttrs = None
                # print("Encountered some data  :", data)
            elif (dataRow is 2):
                currDate = data
                dataRow = False
                # print("Encountered a date  :", data)
            elif (dataRow is 3):
                currView.setDuration(data.strip())
                dataRow = False
                # print("Encountered a duration  :", data)
            elif (dataRow is 4):
                currView.setChannel(data.strip())
                dataRow = False
                # print("Encountered a channel  :", data)
            elif (dataRow is 5):
                if (len(data.strip()) > 1 and data.find('AM') != -1 or data.find('PM') != -1):
                    currView.setTime(data.strip())
                    dataRow = False
                    # print("Encountered a time  :", data)

start = time.time()
print("START TIME:::", start)

parser = MyHTMLParser()

with open('google_activity-origin-aug2016.activity.html', 'r') as f:
    read_data_1 = f.read()
    f.closed
with open('google_activity-aug-nov2016.activity.html', 'r') as f:
    read_data_2 = f.read()
    f.closed

parser.feed(read_data_1)
parser.feed(read_data_2)

#  """ Uncomment for date printouts
dateRegex = re.compile('([A-z]+)? (\d+)?(, \d+)?')
timeRegex = re.compile('(\d+)?:(\d+)? (AM|PM)?')
for i in videoViews:
    d = i.getDate()
    t = i.getTime()
    dateMatch = dateRegex.match(d)
    timeMatch = timeRegex.match(t)
    """
    if (dateMatch):
        print(colored(i.getName() + ':::', 'green'))
        print('Month: ' + str(dateMatch.group(1)) + ' | Date: ' + str(dateMatch.group(2)) + ' | Year: ' + str(dateMatch.group(3)))
    if (timeMatch):
        print('Time: Hour::' + str(timeMatch.group(1)) + ' | MIN:: ' + str(timeMatch.group(2)) + ' | AM/PM:: ' + str(timeMatch.group(3)))
    """

    if (dateMatch is not None and dateMatch.group(2) is not None and not isinstance(dateMatch.group(2), int)):
        _year = 2016
        _month = 1
        if (dateMatch.group(3) is not None):
            regex = re.compile(', ')
            _year = re.sub(regex, "", dateMatch.group(3))
            _year = int(_year)
        else:
            i.setDate(i.getDate() + ', 2016')
        for index, month in enumerate(months):
            if (month.lower().find(str(dateMatch.group(1)).lower()) != -1):
                _month = index + 1

        _date = int(dateMatch.group(2))
        _hour = int(timeMatch.group(1))
        _minute = int(timeMatch.group(2))
        offset = 12
        if (_hour < 12 and str(timeMatch.group(3)) is 'PM'):
            _hour = _hour + offset

        dateTime = datetime.datetime(_year, _month, _date, _hour, _minute)
        _dateTime = ''
        _timestamp = ''
        _hash = ''
        if (dateTime is not None):
            _dateTime = dateTime.isoformat()
            _timestamp = (dateTime.timestamp() + 3600) * 1000
            _hash = hashlib.sha1()
            _hash.update((str(_timestamp) + i.getName() + i.getLink()).encode())
        i.setDateTime(_dateTime + '.000Z')
        i.setTimestamp(str(_timestamp)[:-2])
        i.setHash(str(_hash.hexdigest()))

client = MongoClient()
db = client.youtube_history
countSuccess = 0
countUpdate = 0
countFail = 0

for index, i in enumerate(videoViews):
    # print('INDEX: ', index)
    # i.printContent()
    # result = db.history.insert_one(i.__dict__)
    result = db.history.update({"hash": i.getHash()}, i.__dict__, True)
    # print(result)
    if ('upserted' in result and result['upserted'] is not None):
        countSuccess += 1
    elif ('updatedExisting' in result and result['updatedExisting'] is True):
        countUpdate += 1
    else:
        countFail += 1

end = time.time()
print(colored('TOTAL SUCCESS INSERTS:::', 'magenta'), countSuccess)
print(colored('TOTAL UPDATE INSERTS:::', 'magenta'), countUpdate)
print(colored('TOTAL FAIL INSERTS:::', 'magenta'), countFail)
print(colored('TOTAL VIDEO VIEWS:::', 'magenta'), len(videoViews))
print(colored('END TIME DIFF:::', 'magenta'), end - start)
