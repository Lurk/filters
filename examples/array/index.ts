import { addRule, Filters, toFilterCb, Operators } from "../../src";

interface Book {
  name: string;
  author: string;
  year: number;
  genre: string[];
}

const filter = addRule(
  {} as Filters<Book>,
  "year",
  Operators.greaterThan,
  1981
);

const bookCollection: Book[] = [
  {
    author: "Frank Herbert",
    name: "Dune",
    year: 1965,
    genre: ["Science Fiction"],
  },
  {
    author: "George Orwell",
    name: "1984",
    year: 1949,
    genre: ["Science Fiction", "Dystopia"],
  },
  {
    author: "J.R.R. Tolkien",
    name: "The Lord of the Rings",
    year: 1949,
    genre: ["Fantasy"],
  },
  {
    author: "Alan Moore",
    name: "Watchmen",
    year: 1987,
    genre: ["Science Fiction", "Graphic Novels"],
  },
  {
    author: "William Gibson",
    name: "Neuromancer",
    year: 1984,
    genre: ["Science Fiction", "Cyberpunk"],
  },
  {
    author: "Douglas Adams",
    name: "The Hitchhiker's Guide to the Galaxy",
    year: 1979,
    genre: ["Science Fiction"],
  },
  {
    author: "Isaac Asimov",
    name: "Foundation",
    year: 1951,
    genre: ["Science Fiction"],
  },
  {
    author: "Andy Weir",
    name: "The Martian",
    year: 2012,
    genre: ["Science Fiction"],
  },
];

const booksPublishedAfter1981 = bookCollection.filter(toFilterCb(filter));
