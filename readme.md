# Filter

Here is a problem that I am solving on every project - you have a table/graph with some custom filters. You need to send a query to the backend so it can query a database. Also, You should have the ability to use it as the callback to the Array.filter for cases when data already there. Also, it should be possible to send a link to the current table/graph with filters applied, so it should be serializable to string.

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
import {addRule, Filters} from "@barhamon/filter";

const filter = addRule({} as Filters<Book>, "year", 1981, '>');
```

If our collection is simple array usage of our filter will looks like this

```TS
const BookCollection: Book[] = [
  {author: "Frank Herbert", name: "Dune", year: 1965, genre: ["Science Fiction"]},
  {author: "George Orwell", name: "1984", year: 1949, genre: ["Science Fiction","Dystopia"]}, 
  {author: "J.R.R. Tolkien", name: "The Lord of the Rings", year: 1949, genre: ["Fantasy"]},
  {author: "Alan Moore", name: "Watchmen", year: 1987, genre: ["Science Fiction", "Graphic Novels"]},
  {author: "William Gibson", name: "Neuromancer", year: 1984, genre: ["Science Fiction", "Cyberpunk"]},
  {author: "Douglas Adams", name: "The Hitchhiker's Guide to the Galaxy", year: 1979, genre: ["Science Fiction"]},
  {author: "Isaac Asimov", name: "Foundation", year: 1951, genre: ["Science Fiction"]},
  {author: "Andy Weir", name: "The Martian", year: 2012, genre: ["Science Fiction"]},
]
```
