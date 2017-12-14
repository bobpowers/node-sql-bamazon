var mysql = require("mysql");
var inquirer = require("inquirer");


var takeOrder = function(sqlResults){
	for (var i = 0; i < sqlResults.length; i++) {
		console.log("ID: "+sqlResults[i].item_id+" || Product: "+sqlResults[i].product_name+" || Price: $"+sqlResults[i].price);
	}

	inquirer.prompt([
		{
			type: "input",
			message: "Welcome to bamazon! Please enter the ID number of the product youd like to buy.",
			name: "productID"
		},
		{
			type: "input",
			message: "How many would you like to purchase?",
			name: "itemQuantity",
			default: 1
		},
	]).then(function(response){
		var productID = parseInt(response.productID, 10) - 1;
		var itemQuantity = parseInt(response.itemQuantity, 10);
		var inventoryCheck = parseInt(sqlResults[productID].stock_quantity);
		console.log("Product ID: "+response.productID+" | Quantity: "+response.itemQuantity);
		if (inventoryCheck >= itemQuantity){
			var customerTotal = parseFloat(sqlResults[productID].price, 10) * itemQuantity;
			var remainingInventory = inventoryCheck - itemQuantity;
			console.log("Congradulations! You now own "+itemQuantity+ " "+sqlResults[productID].product_name);
			console.log("\n Time to pay up. You owe: $"+customerTotal);
			productID++
			updateSQL(productID, remainingInventory);
		} else {
			console.log("\n \n****************************************");
			console.log("\n*Insufficient Quantity!*\n \n*Let's give this another try!*\n");
			console.log("****************************************\n \n");
			callSQL();
		}
	});
}

var updateSQL = function(productID, remainingInventory){
	var connection = mysql.createConnection({
		host: "localhost",
	  	port: 3306,
	  	user: "root",
	  	password: "",
	  	database: "bamazon"
	});
	connection.connect(function(err) {
		if (err) {
	 		console.log(err);
	 	} else {
	  	console.log(" ...UPDATING DATABASE... \n");
	  	connection.query(
	  		"UPDATE products SET ? WHERE ?", 
	  		[
	  			{
	  				stock_quantity: remainingInventory
	  			},
	  			{
	  				item_id: productID
	  			}
	  		], 
	  		function(err, res){
	  			if (err) {
	  				console.log(err);
	  			} else {
	  				console.log(res.affectedRows+" products updated!");
	  				connection.end();
	  			}
	  		})
		}
	});

}

var callSQL = function(){
	var connection = mysql.createConnection({
	 	host: "localhost",
	 	port: 3306,
	 	user: "root",
	 	password: "",
	 	database: "bamazon"
	});
	connection.connect(function(err) {
		if (err) {
	 		console.log(err);
	 	} else {
	  	console.log("Connected: "+connection.threadId +"\n");
	  	readProducts();
		}
	});
	function readProducts() {
 		console.log("Selecting available products...\n");
 		connection.query("SELECT * FROM products", function(err, res) {
    		if (err) throw err;
    		takeOrder(res);
    		connection.end();
  		});
	}
};

callSQL();




