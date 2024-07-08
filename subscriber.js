const fs = require("fs");

class Subscriber
{
    constructor(props)
    {
        this.sub_to_add = [];
        this.sub_to_remove = [];
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (Firstname, Lastname)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to get information about the user we want to add to the subscriber list
     * 
     */
    addSub(rl, step, Starter) {
        let query = "";
        let subQuestion = step === 0 ? "First name " : "Last name "; 
        query = step === 0 ? "Please, to add a new subscriber, first, type it's " + subQuestion + "\n"
        : "Now, please, type it's " + subQuestion + "\n";

        try {
            rl.question(query, answer => {
                this.sub_to_add[step] = answer;
                if (step > 0) {
                    if (!this.checkExists(this.sub_to_add, 0))
                       this.addSubToCsv(this.sub_to_add);
                    this.sub_to_add = [];
                    Starter.starter("");
                    return;
                }
                else
                    this.addSub(rl, step + 1, Starter);
            })
        }
        catch (e) {
            console.log("Error while adding a new subscriber\n" + e);
        }
    }

    /**
     * 
     * @param {*} sub Subscriber informations
     * @param {*} step used to know if the user exists, or if the user doesn't exists and try to borrow a book
     * 
     * This function is used to check if subscriber we wants to add does not already exist, and if he tries to borrow a book while not present in the subscriber CSV file
     * 
     */
    checkExists(sub, step) {
        let doesSubExist = false;
        let data = fs.readFileSync("abonnes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        
        linesArray.forEach((line, index) => {
            line = line.slice(1);
            if (sub.length == line.length && sub.every((v) => line.indexOf(v) >= 0)) {
                if (step === 0) {
                    console.log("Subscriber already exists");
                }
                doesSubExist = true;
            }
        });
        if (doesSubExist)
            return true;
        else if (!doesSubExist && step === 2)
            console.log("Non-subscriber can't borrow a book");
        return false;
    }

    /**
     * 
     * @param {*} sub Subscriber informations
     * 
     * This function is used to add the user to the subscriber CSV file
     * 
     */
    addSubToCsv(sub) {
        let subToAppend;
        var fileContents = fs.readFileSync("abonnes.csv");
        var lines = fileContents.toString().split('\n');
        
        subToAppend = "\n" + lines.length + ";" + sub.join(";")
        fs.appendFile('abonnes.csv', subToAppend, (err) => {
            if (err) throw err;
            console.log('Data appended to file');
          });
    }

    /**
     * 
     * @param {*} rl The readLine commands to get the prompt from user
     * @param {*} step Which step the user is in (Firstname, Lastname)
     * @param {*} Starter The starter to call in order to get the next prompt from user
     * 
     * This function is used to check if subscriber we wants to remove is in the CSV file
     * 
     */
    removeSub(rl, step, Starter) {
        let subQuestion = step === 0 ? "First name " : "Last name "; 
        let query = step === 0 ?"Please, to remove a subscriber, first, type it's " + subQuestion + "\n" :
        "Now, please, type it's " + subQuestion + "\n";

        try {
            rl.question(query, answer => {
                this.sub_to_remove[step] = answer;
                if (step > 0) {
                    if (this.checkExists(this.sub_to_remove, 1))
                        this.removeSubFromCsv(this.sub_to_remove);
                    else
                        console.log("Subscriber does not exist");
                    this.sub_to_remove = [];
                    Starter.starter("");
                    return;
                }
                else
                    this.removeSub(rl, step + 1, Starter);
            })
        }
        catch (e) {
            console.log("Error while removing a subscriber\n" + e);
        }

    }
    
    /**
     * 
     * @param {*} sub Subscriber informations
     * 
     * This function is used from remove the user to the subscriber CSV file
     * 
     */
    removeSubFromCsv(sub) {
        let data = fs.readFileSync("abonnes.csv", "utf8");
        let linesExceptFirst = data.split('\n').slice(1);
        let linesArray = linesExceptFirst.map(line=>line.split(';'));
        let toCsv = "Num;Nom;Prenom\n";
        let is_index_found = 0;

        linesArray.forEach((line, index, array) => {
            line = line.slice(1);
            if (sub.length == line.length && sub.every((v) => line.indexOf(v) >= 0)) {
                linesArray.splice(index, 0);
                is_index_found = 1;
            }
            else {
                toCsv += index + 1 - is_index_found + ";" + line.toString().replace(",", ";") + "\n";
            }
        });
        toCsv = toCsv.substring(0, toCsv.length - 1);
        fs.writeFileSync('abonnes.csv', toCsv);
        return;
    }
}

module.exports = {Subscriber};