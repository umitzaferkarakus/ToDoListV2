//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your item!"]
    }
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Deneme1"
})
const item2 = new Item({
    name: "Deneme2"
})
const item3 = new Item({
    name: "Deneme3"
})

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
    
    const day = date.getDate();
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully insert!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: day,
                newListItems: foundItems
            });
        }

    });

});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    })
    item.save();
    res.redirect("/");
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work list",
        newListItems: workItems
    });
});

app.post("/work", function (req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.post("/delete", function (req,res) {
   const checkedItemId = req.body.checkbox;
   Item.findByIdAndRemove(checkedItemId,function(err) {
    if(err){
        console.log(err);
    }else{
        console.log("Succesfully deleted");
    }
   });
   res.redirect("/");
  });




app.listen(3000, function () {
    console.log("Server started on port 3000");
});