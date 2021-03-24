# Filter

Here is a problem that I am solving on every project - you have a table/graph with some custom filters. You need to send a query to the backend so it can query a database. Also, You should have the ability to use it as the callback to the Array.filter for cases when data already there. Also, it should be possible to send a link to the current table/graph with filters applied, so it should be serializable to string.

## Usage

let`s say that we have collection of books

```TS
interface Book {
  name: ""
  author: string,
  year: number,
  genre: string[],
  price: number,
}
```

and we want to create filter which can be applied to the books collection in book store.

```TS
import {addRule, Filters} from "@barhamon/filter";

const filter = addRule({} as Filters<Book>, "author", "Frank Herbert", '=');
```

If our collection is simple array usage of our filter will looks like this

```TS
const BookCollection: Book[] = [
  {author: "Frank Herbert", year: 1965, genre: ["science-fiction"], price: 200},
  {author: "", }
]
```
