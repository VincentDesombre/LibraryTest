const readline = require('readline');
const {Book}              = require("./book");
const {Subscriber}              = require("./subscriber");
const {Borrower}              = require("./borrower");

let rl = readline.createInterface({
    input: process.stdin, 
    output: process.stdout
});
let book = new Book();
let sub = new Subscriber();
let borrower = new Borrower({book, sub});

/**
 * 
 * @param {*} answer Answer from the user prompt
 * @param {*} Starter Starter object
 * 
 * Commands we get from prompt are used to move in the library
 * 
 */
function parseAnswerFromUser(answer, Starter) {
    answer === "addBook" ? book.addBook(rl, 0, Starter) : 
    answer === "removeBook" ? book.removeBook(rl, 0, Starter) : 
    answer === "listBook" ? book.bookListing(Starter) : 
    answer === "addSubscriber" ? sub.addSub(rl, 0, Starter) : 
    answer === "removeSubscriber" ? sub.removeSub(rl, 0, Starter) :
    answer === "addBorrower" ? borrower.addBorrower(rl, 0, Starter) : 
    answer === "removeBorrower" ? borrower.removeBorrower(rl, 0, Starter) :
    answer === "listBookBorrowed" ? borrower.borrowerListing(Starter) :
    "";
}

class Starter {
    constructor(props) {}

    /**
     * 
     * @param {*} query Starter sentence to give informations about all available commands
     * 
     * Main function
     * 
     */
    static starter(query) {
        try {
            rl.question(query, answer => {
                if (answer === "exit")
                    {
                        rl.close();
                        return ;
                    }
                parseAnswerFromUser(answer, Starter);
                Starter.starter("");
            })
        }
        catch (e) {
            console.log("Error\n" + e);
        }
    }
}

Starter.starter("Hello, this is a library test, here is the list of commands available :\n - addBook to add a new book\n - removeBook to remove a book\n - listBook to list all books available\n - addSubscriber to add a new subscriber\n - removeSubscriber to remove a subscriber\n - addBorrower to borrow a book\n - removeBorrower to remove a book borrowed\n - listBookBorrowed to list all books that are already borrowed\n");

module.exports = {Starter};