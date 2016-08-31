#!/usr/bin/env python3
""".

Python parser for Google myactivity HTML dump

"""

from html.parser import HTMLParser
from classes.VideoView import VideoView
from termcolor import colored
import time

videoViews = []
currView = None
dataRow = False
currDate = ''


class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        global currView, dataRow
        # print("TAG:: ", tag)

        if (tag == 'md-card-content'):
            currView = VideoView()
            dataRow = False
            print(colored('Encountered a start tag:', 'cyan'), tag)
        elif (tag == 'a'):
            print(colored('Encountered a start tag:', 'cyan'), tag)
            c = False
            for attr in attrs:
                if (attr[0] == 'class'):
                    c = True
            if c is False:
                dataRow = 1
        elif (tag == 'h2'):
            print(colored('Encountered a start tag:', 'cyan'), tag)
            for attr in attrs:
                if (attr[0] == 'class' and attr[1] != '' and attr[1].find('fp-date-block-date') != -1):
                    dataRow = 2
        else:
            dataRow = False

    def handle_endtag(self, tag):
        global currView, dataRow, videoViews
        if (tag is not None
                and tag != '' and
                tag == 'md-card-content' or tag == 'a'):
            dataRow = False
            print(colored('Encountered an end tag:', 'red'), tag)
        if (tag == 'md-card-content' and currView.getName() != ''):
            videoViews.append(currView)
            print(
                colored('END:: CURRENT VIEW NAME: ', 'green'),
                colored(currView.getName(), 'green'),
                colored(currView.getDate(), 'green'),)
            print('--------------------------')

    def handle_data(self, data):
        global currView, dataRow, currDate
        if (dataRow is not None
                and dataRow is not False
                and data is not None
                and data != ''):
            if (dataRow is 1):
                currView.setName(data.strip())
                currView.setDate(currDate.strip())
                dataRow = False
                print("Encountered some data  :", data)
            elif (dataRow is 2):
                currDate = data
                dataRow = False
                print("Encountered a date  :", data)

start = time.time()
print("START TIME:::", start)

parser = MyHTMLParser()
#  with open('test3.html', 'r') as f:
with open('google_activity_html_dump.html', 'r') as f:
    read_data = f.read()
    f.closed

parser.feed(read_data)

""" Uncomment for date printouts
for i in videoViews:
    print(i.date)
"""

end = time.time()
print(colored('TOTAL VIDEO VIEWS:::', 'magenta'), len(videoViews))
print(colored('END TIME DIFF:::', 'magenta'), end - start)
