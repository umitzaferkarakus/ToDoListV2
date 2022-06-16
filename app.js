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

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

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
    const listName = req.body.list;
    const day = date.getDate();
    const item = new Item({
        name: itemName
    });

    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName},function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }


});


app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" +customListName);
            } else {
                //Show an list
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });

});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Succesfully deleted");
        }
    });
    res.redirect("/");
});




app.listen(3000, function () {
    console.log("Server started on port 3000");
});