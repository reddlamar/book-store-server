import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: ID
    name: String
    publisher: Publisher
    authors: [Author]
  }

  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Publisher {
    id: ID!
    name: String!
    books: [Book!]!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book!]!
    book(id: ID!): Book!
    publishers: [Publisher!]!
    publisher(id: ID!): Publisher!
    authors: [Author!]!
    author(id: ID!): Author!
  }

  type Mutation {
    createBook(book: BookInput!): Book!
    deleteBook(bookId: ID!): [Book!]!
    updateBook(bookId: ID!, book: BookInput!): Book!
  }

  input BookInput {
    name: String!
    publisherId: ID!
    authorIds: [ID!]!
  }
`;

let books = [
  {
    id: "design-patterns",
    name: "Design Patterns - Elements of Reusable Object-Oriented Software",
    publisherId: "addison-wesley",
    authorIds: [
      "erich-gamma",
      "richard-helm",
      "ralph-johnson",
      "john-vlissides",
    ],
  },
  {
    id: "refactoring",
    name: "Refactoring - Improving the Design of Existing Code",
    publisherId: "addison-wesley",
    authorIds: ["martin-fowler"],
  },
  {
    id: "patterns-of-enterprise-application-architecture",
    name: "Patterns of Enterprise Application Architecture",
    publisherId: "addison-wesley",
    authorIds: ["martin-fowler"],
  },
  {
    id: "domain-driven-design",
    name: "Domain-Driven Design",
    publisherId: "addison-wesley",
    authorIds: ["eric-evans"],
  },
  {
    id: "clean-code",
    name: "Clean Code - A Handbook of Agile Software Craftsmanship",
    publisherId: "prentice-hall",
    authorIds: ["robert-martin"],
  },
  {
    id: "agile-software-development",
    name: "Agile Software Development, Principles, Patterns, and Practices",
    publisherId: "pearson",
    authorIds: ["robert-martin"],
  },
];

const publishers = [
  {
    id: "addison-wesley",
    name: "Addison Wesley",
    bookIds: [
      "design-patterns",
      "refactoring",
      "patterns-of-enterprise-application-architecture",
      "domain-driven-design",
    ],
  },
  {
    id: "prentice-hall",
    name: "Prentice Hall",
    bookIds: ["clean-code"],
  },
  {
    id: "pearson",
    name: "Pearson Publishing",
    bookIds: ["agile-software-development"],
  },
];

const authors = [
  {
    id: "erich-gamma",
    name: "Erich Gamma",
    bookIds: ["design-patterns"],
  },
  {
    id: "richard-helm",
    name: "Richard Helm",
    bookIds: ["design-patterns"],
  },
  {
    id: "ralph-johnson",
    name: "Ralph Johnson",
    bookIds: ["design-patterns"],
  },
  {
    id: "john-vlissides",
    name: "John Vlissides",
    bookIds: ["design-patterns"],
  },
  {
    id: "martin-fowler",
    name: "Martin Fowler",
    bookIds: ["refactoring", "patterns-of-enterprise-application-architecture"],
  },
  {
    id: "eric-evans",
    name: "Eric Evans",
    bookIds: ["domain-driven-design"],
  },
  {
    id: "robert-martin",
    name: "Robert C. Martin",
    bookIds: ["clean-code", "agile-software-development"],
  },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    book: (_: any, args: any) => {
      return books.find((b) => b.id === args.id);
    },
    publishers: () => publishers,
    publisher: (_: any, args: any) => {
      return publishers.find((p) => p.id === args.id);
    },
    authors: () => authors,
    author: (_: any, args: any) => {
      return authors.find((a) => a.id === args.id);
    },
  },

  Mutation: {
    createBook: (_: any, args: any) => {
      const id = args.book.name.replaceAll(" ", "-");
      books.push({ id, ...args.book });
      return args.book;
    },
    deleteBook: (_: any, args: any) => {
      books = books.filter((b) => b.id !== args.bookId);
      return books;
    },
  },

  Book: {
    publisher(parent: any) {
      return publishers.find((p) => p.id === parent.publisherId);
    },
    authors(parent: any) {
      return authors.filter((a) => parent.authorIds.includes(a.id));
    },
  },

  Author: {
    books(parent: any) {
      return books.filter((b) => parent.bookIds.includes(b.id));
    },
  },

  Publisher: {
    books(parent: any) {
      return books.filter((b) => parent.bookIds.includes(b.id));
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
