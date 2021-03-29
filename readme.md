# Filter

Library to deal with the data filter options in a generic way. 
Written in Typescript with zero dependencies.

## Usage

let`s say that we have collection of books

```TS
interface Book {
  name: string
  author: string,
  year: number,
  genre: string[],
}
```

And we want to know which books were published after 1981.

```TS
import {addRule, Filters, createFilterCb, Operators} from "@barhamon/filters";

const filter = addRule({} as Filters<Book>, "year", Operators.greaterThan, 1981);
```

If our collection is simple array usage of filter will look like this

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

if we want to send filter as GET param to our API

```TS
import {addRule, Filters, toQueryString, Operators} from "@barhamon/filters";

interface Book {
  name: string
  author: string,
  year: number,
  genre: string[],
}

const filter = addRule({} as Filters<Book>, "year", Operators.greaterThan, 1981);

await fetch(`https://apihost.com/books/?filter=${toQueryString(filter)}`)
```

And let`s say on the backend we have ExpressJS and MongoDB
```TS
//assuming import {api, db} from './server';
import {Filters, parse, toMongoQuery} from "@barhamon/filters";

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
and we also want to update the filter param in the browser URL to be able to send the link for this page to our colleague.
```TS
const { protocol, host, pathname, search } = window.location;
const params = new URLSearchParams(search);
const queryString = toQueryString(filter);
params.set("filter", queryString);
const newUrl = `${protocol}//${host}${pathname}?${params.toString()}`;
if(newUlr.length > 2048){
  throw new Error(`Url can not be longer than 2048 characters. Length of filters serialized to string is ${queryString.length}`)
}
window.history.push({ path: newUrl }, "", newUrl);
```

## API

### Value types
Value can be either string, number, or boolean type.

### Operators
Filters package uses this comparison query operators:

0. equals
1. not equals
2. greater than
3. less than
4. greater than or equal to
5. less than or equal to
6. contains

there is Operators enum, so you don`t need to remember all this.

### addRule
adds rule to existing filters

usage:
```TS
const filterByYear = addRule({} as Filters<Book>, "year", Operators.greaterThan, 1981);
const filterByYearAndGenre = addRule(filter, "genre", Operators.contains, "ict")
```
### removeRule
removes rule from existing filters

usage:
```TS
const filterByYear = removeRule(filterByYearAndGenre, "genre");
```

### toString
creates JSON.string from filter with this format
```
{"key":[[value, operator]]} or if operator is Operators.equal {"key":[[value]]}
```
for example:
```TS
    console.log(
      toString(
        fromArray([
          ["year", Operators.equal, 1965],
          ["year", Operators.greaterThan, 1982],
          ["genre", Operators.contains, "ict"],
        ])
      )
    );
```
will output string: '{"year":[\[1965],[1982,2]],"genre":[\["ict",6]]}'
```JSON
{
  "year": [[1965], [1982, 2]],
  "genre": [["ict", 6]],
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
Be aware of url length limitation. 
### toMongoQuery
creates mongoDb query from filter,
usage:
```TS
const query = toMongoQuery(filterByYearAndGenre);
```
### toFilterCb
creates callback for Array.filter from filter
usage:
```TS
const cb = toFilterCb(filterByYearAndGenre);
```

### fromArray
creates new filter from array

usage:
```TS
const filterByYearAndGenre = fromArray([
  ["year", Operators.greaterThan, 1981],
  ["genre", Operators.contains, "ict"]
]);
```
### fromString
creates new filter from string

usage:
```TS
const filterByYearAndGenre = fromString('{"year":[[1981,2]],"genre":[["ict":6]]}')
```
### fromQueryString
creates new filter from url encoded string,
usage:
```TS
const filterByYearAndGenre = fromQueryString('%7B%22year%22%3A%5B%5B1981%2C2%5D%5D%2C%22genre%22%3A%5B%5B%22ict%22%2C6%5D%5D%7D')
```
