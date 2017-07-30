//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

//Use a function and inquirer to prompt the customer
function start() {
  //first display all items available for sale
  connection.query('SELECT item_id, product_name, price FROM products', function(err, results) {
    if (err) throw err;
    //customer will be prompted twice using inquirer
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "Which item would you like to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like?"
        }
      ])
      .then(function(answer) {
        //get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_name === answer.choice) {
            chosenItem = results[i];
          }
        }
        //Once customer has placed order, app should check if you have enough
        if (parseInt(answer.quantity) <= chosenItem.stock_quantity) {
          //we have enough, so update db, let user know, start over
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: stock_quantity - answer.quantity
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if(error) throw err;
              console.log("Thank you for your purchase!");
              start();
            }
          );
        }
        else {
          //We don't have enough left
          console.log("We don't have enough left. Please choose another item.");
          start();
        }
      });
  });
}
