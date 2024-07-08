const fs = require("fs");

class Borrower
{
    constructor(props)
    {
            this.borrower_to_add = [];
            this.borrower_to_remove = [];
            this.book = props.book;
            this.sub = props.sub;
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (Firstname, Lastname, ISBN)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to get information about the user we want to add to the borrower list
     * 
     */
    addBorrower(rl, step, Starter) {
        let query = "";
        query = step === 0 ? "Please, to add a new borrower, first, type it's Firstname\n" : 
        step === 1 ? "Now, please, type it's Lastname\n" :
        "Finally, type the book's ISBN\n";

        try {
            rl.question(query, answer => {
                if (answer.trim().length === 0) {
                    console.log("Informations must not be empty strings");
                    Starter.starter("");
                    return;
                }
                this.borrower_to_add[step] = answer;
                if (step > 1) {
                    if (!this.checkBorrowerValidity(this.borrower_to_add) && 
                    this.sub.checkExists([this.borrower_to_add[0], this.borrower_to_add[1]], 2)
                    && this.book.checkBookExistsValidity([this.borrower_to_add[step]], 1))
                        this.addBorrowerToCsv(this.borrower_to_add);
                    this.borrower_to_add = [];
                    Starter.starter("");
                    return;
                }
                else
                    this.addBorrower(rl, step + 1, Starter);
            })
        }
        catch (e) {
            console.log("Error while adding a new borrower\n" + e);
        }
    }

    /**
     * 
     * @param {*} bor Borrower to add
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to check if the book the user is trying to borrow is not already borrowed by someone else
     * 
     */
    checkBorrowerValidity(bor) {
        let doesBorExist = false;
        let data = fs.readFileSync("livres_empruntes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));

        linesArray.forEach((line, index) => {
            line = line.slice(1);
            if (bor[bor.length - 1] === line[line.length - 1]) {
                console.log("Someone already borrowed this book");
                doesBorExist = true;
            }
        });
        if (doesBorExist)
            return true;
        return false;
    }

    /**
     * 
     * @param {*} bor Borrower to remove
     * 
     * This function is used to check if the user to remove and the ISBN from the book is in the CSV file
     */
    checkBorrowerExistsValidity(bor) {
        let doesBorExist = false;
        let data = fs.readFileSync("livres_empruntes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));

        linesArray.forEach((line, index) => {
            if (bor.length == line.length && bor.every((v) => line.indexOf(v) >= 0)) {
                doesBorExist++;
                linesArray.splice(index, 0);
            }
        });
        if (doesBorExist) {
            console.log("Borrower got removed from the library");
            return true;
        }
        console.log("Borrower to remove does not exists")
        return false;
    }

    /**
     * 
     * @param {*} borrower Borrower to add
     * 
     * This function is used to add a borrower from the CSV file once we are sure he does exist
     * 
     */
    addBorrowerToCsv(borrower) {
        let borrowerToAppend = "\n" + borrower.join(";");

        fs.appendFile('livres_empruntes.csv', borrowerToAppend, (err) => {
            if (err) throw err;
            console.log('Data appended to file');
          });
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (Firstname, Lastname, ISBN)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to get information about the user we want to remove
     * 
     */
    removeBorrower(rl, step, Starter) {
        let query = "";
        query = step === 0 ? "Please, to remove a borrower, first, type it's Firstname\n" : 
        step === 1 ? "Now, please, type it's Lastname\n" :
        "Finally, type the book's ISBN\n";

        try {
            rl.question(query, answer => {
                if (step > 1) {
                    this.borrower_to_remove[step] = answer;
                    if (this.book.checkBookExistsValidity([this.borrower_to_remove[step]], 1) && this.checkBorrowerExistsValidity(this.borrower_to_remove))
                        this.removeBorrowerFromCsv(this.borrower_to_remove);
                    else
                        console.log("This book is not borrowed by this person");
                    this.borrower_to_remove = [];
                    Starter.starter("");
                    return;
                }
                else
                    this.removeBorrower(rl, step + 1, Starter);
            })
        }
        catch (e) {
            console.log("Error while removing a borrower\n" + e);
        }

    }

    /**
     * 
     * @param {*} borrower Borrower to remove
     * 
     * This function is used to remove a borrower from the CSV file once we are sure he does exist
     * 
     */
    removeBorrowerFromCsv(borrower) {
        let data = fs.readFileSync("livres_empruntes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        let toCsv = "Prenom;Nom;ISBN\n";

        linesArray.forEach((line, index) => {
            if (borrower.length == line.length && borrower.every((v) => line.indexOf(v) >= 0)) {
                linesArray.splice(index, 0);
            }
            else
                toCsv += line.join(";") + "\n";
        });
        toCsv = toCsv.substring(0, toCsv.length - 1);
        fs.writeFileSync('livres_empruntes.csv', toCsv);
        return;
    }

    /**
     * 
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to get the list of all books borrowed
     * 
     */
    borrowerListing(Starter) {
        let data = fs.readFileSync("livres_empruntes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));

        linesArray.forEach((lines) => {
            console.log(lines.join("  |  ") + "\n");
        })
        Starter.starter("");
        return;
    }
}

module.exports = {Borrower};