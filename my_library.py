#!/usr/bin/env python3

import urllib.request
import xml.etree.ElementTree as ET
import datetime

api_key = 'aV2eHKdyALV4q1nmm7n56w'
api_secret = 'aEDGhsTpjnQQaPVidaAfwvWu3NZWDSMopKkza7tunsc'
eldritch_cheese = 64119873

class Book:
    def __init__(self, title, authors, publication_date,
                 isbn, isbn13,
                 rating, average_rating, ratings_counts,
                 shelves):
        self.title = title
        self.authors = authors
        self.publication_date = publication_date
        self.isbn = isbn
        self.isbn13 = isbn13
        self.rating = rating
        self.average_rating = average_rating
        self.ratings_counts = ratings_counts
        self.shelves = shelves

    @classmethod
    def from_xml(cls, xml_chunk):
        title = xml_chunk.find('.//title').text
        authors = [author.find('name').text for author in
                   xml_chunk.iterfind('.//author')]

        publication_year = xml_chunk.find('.//publication_year')
        publication_month = xml_chunk.find('.//publication_month')
        publication_day = xml_chunk.find('.//publication_day')

        if publication_year and publication_month and publication_day:
            publication_date = datetime.date(publication_year,
                                             publication_month,
                                             publication_day)
        else:
            publication_date = None

        isbn = xml_chunk.find('.//isbn').text
        isbn13 = xml_chunk.find('.//isbn13').text

        rating = int(xml_chunk.find('.//rating').text)
        if rating==0:
            rating = None
        average_rating = float(xml_chunk.find('.//average_rating').text)
        ratings_count = int(xml_chunk.find('.//ratings_count').text)

        shelves = [shelf.get('name') for shelf in
                   xml_chunk.iterfind('.//shelf')]

        return Book(title, authors, publication_date,
                    isbn, isbn13,
                    rating, average_rating, ratings_count,
                    shelves)

def get_xml(user_id):
    review_list_url = 'https://www.goodreads.com/review/list'
    params = {'v':2,
              'id':user_id,
              'key':api_key}
    url = (review_list_url + '?' +
           '&'.join('{}={}'.format(key,value) for key,value in params.items()))
    response = urllib.request.urlopen(url)
    return response.read().decode('utf-8')

def get_book_list(user_id):
    xml = get_xml(user_id)
    tree = ET.fromstring(xml)
    books = [Book.from_xml(review) for review in tree.iterfind('.//review')]

    import IPython; IPython.embed()

get_book_list(eldritch_cheese)
