let api_key = 'aV2eHKdyALV4q1nmm7n56w';
let eldritch_cheese_id = '64119873';

let all_books = [];

function get_review_list(user_id) {
    let params = ['v=2',
                  'id=' + user_id,
                  'key=' + api_key].join('&')
    let goodreads_url = "https://www.goodreads.com/review/list?"+params;

    let query = 'select * from xml where url="' + goodreads_url + '"';
    query = encodeURI(query).replace(/&/g,'%26');
    let yahoo_url = ('https://query.yahooapis.com/v1/public/yql?' +
                     ['q=' + query,
                     'format=xml'].join('&'));

    document.getElementById("link-test").innerHTML = "Data Link";
    document.getElementById("link-test").href = goodreads_url

    let request = new XMLHttpRequest();
    request.open("GET", yahoo_url, true);

    request.onload = function() {
        if(request.status >= 200 && request.status < 400) {
            load_xml(request.responseText);
        } else {
            document.getElementById("book-table").innerHTML = "Error grabbing list: " + request.status;
        }
    };

    request.onerror = function() {
        document.getElementById("book-table").innerHTML = "onerror grabbing list: " + request.status;
    };

    request.send();
}

function Book(xml) {
    this.isbn = xml.querySelector('isbn').innerHTML;
    this.isbn13 = xml.querySelector('isbn13').innerHTML;
    this.title = xml.querySelector('title').innerHTML;
    this.authors = Array.prototype.map.call(
        xml.querySelectorAll('author'),
        function(author) {
            return {'name':author.querySelector('name').innerHTML,
                    'average_rating':author.querySelector('average_rating').innerHTML};
        });

    this.shelves = Array.prototype.map.call(
        xml.querySelectorAll('shelf'),
        function(shelf) {
            return shelf.attributes.name.value;
        });
}

Book.prototype.table_row = function() {
    columns = [this.authors.map(function(auth) { return auth.name }).join(','),
               this.title,
              ];

    return ("<tr>" +
            columns.map(function(f) { return "<td>" + f + "</td>";}).join('') +
            "</tr>");
};

function table_header() {
    columns = ['Author',
               'Title',
              ];

    return ("<tr>" +
            columns.map(function(f) { return "<th>" + f + "</th>";}).join('') +
            "</tr>");
}

function load_xml(text) {
    dom = (new DOMParser).parseFromString(text,"text/xml");
    let review_start = dom.querySelector('reviews').attributes.start;
    let review_end = dom.querySelector('reviews').attributes.end;

    let records = Array.prototype.map.call(
        dom.querySelectorAll('review'),
        function (book) { return new Book(book); });
    all_books = records;
    make_table();}

function make_table() {
    let div = document.getElementById('book-table');
    div.innerHTML = ("<table>" +
                     table_header() +
                     all_books.map(
                         function(book) { return book.table_row(); }
                     ).join('') +
                     '</table>');
}
