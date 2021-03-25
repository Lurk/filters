# Filter

Here is a problem that I am solving on every project - I have a table/graph with some custom filters. I need to send a query to the backend so it can query a database. Also, I should have the ability to use it as the callback to the Array.filter for cases when data already there. Also, it should be possible to send a link to the current table/graph with filters applied, so it should be serializable to string.

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

it should be fairly easy add converters to any database, and for any language you are using.

## API

### addRule
adds rule to existing filters

usage:
```TS
const filter = addRule({} as Filters<Book>, "year", '>', 1981);

const filter2 = addRule(filter, )
```

### fromArray
creates new filter from array

usage:
```TS

```
  fromString - creates new filter from string
  fromQueryString - creates new filter from url encoded string,
  toMongoQuery - creates mongoDb query from filter,
  toString - creates JSON.string from filter,
  toQueryString - creates url encoded string from filter,
  toFilterCb - creates callback for Array.filter from filter