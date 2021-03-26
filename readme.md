# Filter

Here is a problem that I am solving on almost every project - I have a table/graph with some custom filters. I need to send a query to the backend so it can query a database. Also, I should have the ability to use it as the callback to the Array.filter for cases when data already there. Also, it should be possible to send a link to the current table/graph with filters applied.


## Usage

let`s say that I have collection of books

```TS
interface Book {
  name: string
  author: string,
  year: number,
  genre: string[],
}
```

And I want to know which books were published after 1981.

```TS
import {addRule, Filters, createFilterCb} from "@barhamon/filter";

const filter = addRule({} as Filters<Book>, "year", '>', 1981);
```

If my collection is simple array usage of filter will look like this

```TS
const bookCollection: Book[] = [
  {author: "Frank Herbert", name: "Dune", year: 1965, genre: ["Science Fiction"]},
  {author: "George Orwell", name: "1984", year: 1949, genre: ["Science Fiction","Dystopia"]},
  {author: "J.R.R. Tolkien", name: "The Lord of the Rings", year: 1949, genre: ["Fantasy"]},
  {author: "Alan Moore", name: "Watchmen", year: 1987, genre: ["Science Fiction", "Graphic Novels"]},
  {author: "William Gibson", name: "Neuromancer", year: 1984, genre: ["Science Fiction", "Cyberpunk"]},
  {author: "Douglas Adams", name: "The Hitchhiker's Guide to the Galaxy", year: 1979, genre: ["Science Fiction"]},
  {author: "Isaac Asimov", name: "Foundation", year: 1951, genre: ["Science Fiction"]},
  {author: "Andy Weir", name: "The Martian", year: 2012, genre: ["Science Fiction"]},
]

const booksPublishedAfter1981 =  bookCollection.filter(createFilterCb(filter));
```

if I want to send filter as GET param to my API

```TS
import {addRule, Filters, toQueryString} from "@barhamon/filter";

interface Book {
  name: string
  author: string,
  year: number,
  genre: string[],
}

const filter = addRule({} as Filters<Book>, "year", '>', 1981);

const queryString = toQueryString(filter);
await fetch(`https://apihost.com/books/?filter=${queryString}`)
```

And let`s say on the backend I have ExpressJS and MongoDB
```TS
//assuming import {api, db} from './server';
import {Filters, parse, toMongoQuery} from "@barhamon/filter";

interface Book {
  name: string
  author: string,
  year: number,
  genre: string[],
}

api.get('/books/', async (req, res) =>{
    let filter = fromQueryString<Book>(req.query.filter);
    const books = await db.collection.find(toMongoQuery(filter));
    res.json(books);
})
```
and I also want to update the filter param in the browser URL to be able to send the link for this page to my colleague.
```TS
const { protocol, host, pathname, search } = window.location;
const params = new URLSearchParams(search);
params.set("filter", toQueryString(filter));
const newUrl = `${protocol}//${host}${pathname}?${params.toString()}`;
window.history.replaceState({ path: newUrl }, "", newUrl);
```

## API

### Value types
Value can be either string, number, or boolean type.

### Operations

Filters package uses this operations
for every type of value:
* = - equals
* != - not equals

for number values:
* \> - bigger than
* < - less than
* \>= - greater than or equal to
* <= - less than or equal to

for string values:
* ~ - contains

### addRule
adds rule to existing filters

usage:
```TS
const filterByYear = addRule({} as Filters<Book>, "year", ">", 1981);
const filterByYearAndGenre = addRule(filter, "genre", "~", "ict")
```
### removeRule
removes rule from existing filters

usage:
```TS
const filterByYear = removeRule(filterByYearAndGenre, "genre");
```


### fromArray
creates new filter from array

usage:
```TS
const filterByYearAndGenre = fromArray([
  ["year", ">", 1981],
  ["genre", "~", "ict"]
]);
```
### fromString
creates new filter from string

usage:
```TS
const filterByYearAndGenre = fromString('{"year":[[1981,">"]],"genre":[["ict","~"]]}')
```
### fromQueryString
creates new filter from url encoded string,
usage:
```TS
const filterByYearAndGenre = fromQueryString('%7B%22year%22%3A%5B%5B1981%2C%22%3E%22%5D%5D%2C%22genre%22%3A%5B%5B%22ict%22%2C%22~%22%5D%5D%7D')
```
### toMongoQuery
creates mongoDb query from filter,
usage:
```TS
const query = toMongoQuery(filterByYearAndGenre);
```
### toString
creates JSON.string from filter with this format
```
{"key":[[value, operation]]} or if operation is = {"key":[[value]]}
```
for example:
```TS
    console.log(
      toString(
        fromArray([
          ["year", "=", 1965],
          ["year", ">", 1982],
          ["genre", "~", "ict"],
        ])
      )
    );
```
will output
```JSON
{
  year: [[1965], [1982, ">"]],
  genre: [["ict", "~"]],
}
```

usage:
```TS
const string = toString(filterByYearAndGenre);
```
### toQueryString
creates url encoded string from filter
usage:
```TS
const string = toQueryString(filterByYearAndGenre);
```

### toFilterCb
creates callback for Array.filter from filter
usage:
```TS
const cb = toFilterCb(filterByYearAndGenre);
```