#!/usr/bin/env python3
""".

Python parser for Google myactivity HTML dump

"""

from html.parser import HTMLParser
from classes.VideoView import VideoView
from termcolor import colored
import time

currView = None
dataRow = False


class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        global currView, dataRow
        # print("TAG:: ", tag)

        if (tag == 'md-card-content'):
            currView = VideoView()
            dataRow = False
            print(colored('Encountered a start tag:', 'cyan'), tag)
        if (tag == 'a'):
            print(colored('Encountered a start tag:', 'cyan'), tag)
            c = False
            for attr in attrs:
                if (attr[0] == 'class'):
                    c = True
            if c is False:
                dataRow = True
        else:
            dataRow = False
        if (currView is not None and currView.getName() != ''):
            dataRow = False

    def handle_endtag(self, tag):
        global currView, dataRow
        if (tag is not None
                and tag != '' and
                tag == 'md-card-content' or tag == 'a'):
            dataRow = False
            print(colored('Encountered an end tag:', 'red'), tag)
        if (tag == 'md-card-content'):
            print(colored('END:: CURRENT VIEW NAME: ', 'green'), colored(currView.getName(), 'green'))
            print('--------------------------')

    def handle_data(self, data):
        global currView, dataRow
        if (dataRow is not None
                and dataRow is True
                and data is not None
                and data != ''):
            currView.setName(data)
            print("Encountered some data  :", data)

start = time.time()
print("START TIME:::", start)

parser = MyHTMLParser()
with open('google_activity_html_dump.html', 'r') as f:
    read_data = f.read()
    f.closed

parser.feed(read_data)

end = time.time()
print('END TIME DIFF:::', end - start)
