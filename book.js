const fs = require("fs");

class Book
{
    constructor(props)
    {
            this.book_to_add = [];
            this.book_to_remove = [];
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (ISBN, Title, Title supplement...)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to get information about the book we want to add to the book list
     * 
     */
    addBook(rl, step, Starter) {
        let query = "";
        let bookQuestion = step === 0 ? "ISBN" : 
            step === 1 ? "Title " : 
            step === 2 ? "Title suplement " : 
            step === 3 ? "Main writer's last name " : 
            step === 4 ? "Main writer's first name " : 
            step === 5 ? "Main writer's job " :
            step === 6 ? "Secondary writer's last name " : 
            step === 7 ? "Secondary writer's first name " : 
            step === 8 ? "Secondary writer's job " : "Editor ";
        query = step === 0 ? "Please, to add a new book, first, type it's " + bookQuestion + "\n"
        : "Now, please, type it's " + bookQuestion + "\n";
        try {
            rl.question(query, answer => {
                this.book_to_add[step] = answer;
                if (step > 8) {
                    if (!this.checkBookValidity(this.book_to_add))
                        this.addBookToCsv(this.book_to_add);
                    console.log("1");
                    this.book_to_add = [];
                    Starter.starter("");
                    return;
                }
                else
                    this.addBook(rl, step + 1, Starter);
            })
        }
        catch (e) {
            console.log("Error while adding a new book\n" + e);
        }
    }

    /**
     * 
     * @param {*} book Book informations
     * 
     * This function is used to check if book we wants to add does not already exist
     * 
     */
    checkBookValidity(book) {
        let doesBookExist = false;
        let data = fs.readFileSync("livres.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        linesArray.forEach((line, index) => {
            line = line.slice(1);
            if (book.length == line.length && book.every((v) => line.indexOf(v) >= 0)) {
                console.log("Book already exists")
                doesBookExist = true;
            }
        });
        if (doesBookExist)
            return true;
        return false;
    }


    /**
     * 
     * @param {*} book Subscriber informations
     * @param {*} fromBorrower used to know if the book exists, or if the book doesn't exists and someone tries to borrow it
     * 
     * This function is used to check if the book we wants to remove does exist in the CSV file, and if a borrower tries to borrow it while it is not present in the book CSV file
     * 
     */
    checkBookExistsValidity(book, fromBorrower) {
        console.log(book);
        let doesBookExist = 0;
        let data = fs.readFileSync("livres.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        linesArray.forEach((line, index) => {
            if (book[0] == line[1]) {
                doesBookExist++;
                linesArray.splice(index, 0);
            }
        });
        if (doesBookExist === 1 && fromBorrower === 0) {
            console.log("Book got removed from the library");
            return true;
        }
        else if (doesBookExist === 1 && fromBorrower !== 0) {
            return true;
        }
        else if (doesBookExist > 1) {
            console.log("Error, multiple books with the same ISBN exists");
            return false;
        }
        if (fromBorrower === 0)
            console.log("Book to remove does not exist")
        else
            console.log("Book to borrow does no exist")
        return false;
    }

    /**
     * 
     * @param {*} book Subscriber informations
     * 
     * This function is used to add the book to the book CSV file
     * 
     */
    addBookToCsv(book) {
        fs.readFile("livres.csv", "utf8", function(err, data) {
            let lines = data.trim().split('\n');
            let lastLine = lines.slice(-1)[0];
            book.unshift(parseInt(lastLine.split(";")[0]) + 1);
            let bookToAppend =  "\n" + book.join(";");
            fs.appendFile('livres.csv', bookToAppend, (err) => {
                if (err) throw err;
                console.log('Data appended to file');
              });
        });
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (Firstname, Lastname)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to check if the book we wants to remove is in the CSV file
     * 
     */
    removeBook(rl, step, Starter) {
        let query = "Please, to remove a book, type it's ISBN\n"
        try {
            rl.question(query, answer => {
                this.book_to_remove[step] = answer;
                if (this.checkBookExistsValidity(this.book_to_remove, 0))
                    this.removeBookFromCsv(this.book_to_remove);
                this.book_to_remove = [];
                Starter.starter("");
                return;
            })
        }
        catch (e) {
            console.log("Error while removing a book\n" + e);
        }

    }

    /**
     * 
     * @param {*} book Subscriber informations
     * 
     * This function is used to remove the book from the book CSV file
     * 
     */
    removeBookFromCsv(book) {
        let data = fs.readFileSync("livres.csv", "utf8");
        let lines = data.split('\n');
        let linesArray = lines.map(line=>line.split(';'));
        let toCsv = "";
        linesArray.forEach((line, index) => {
            if (book[0] !== line[1]) {
                toCsv += line.join(';') + "\n";
            }
        });
        fs.writeFileSync('livres.csv', toCsv);
        return;
    }

    /**
     * 
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to list all books present in the book CSV file
     * 
     */
    bookListing(Starter) {
        let data = fs.readFileSync("livres.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        linesArray.forEach((lines) => {
            console.log(lines.join("  |  ") + "\n\n");
        })
        Starter.starter("");
        return;
    }
}

module.exports = {Book};