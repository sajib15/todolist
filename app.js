/*jshint esversion: ES6 */

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sajib:Sajib%40143327@cluster0.uwcaxzp.mongodb.net/todolistDB");

const itemScema = {
  name: String
};

const Item = mongoose.model("Item", itemScema);
const item1 = new Item({
  name: "Welcome to your to do list."
});
const item2 = new Item({
  name: "Hit This +Button to add a new item."
});
const item3 = new Item({
  name: "Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
const listScema = {
  name: String,
  items: [itemScema]
};
const List = mongoose.model("list", listScema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully add items");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", {
        itemlists: "Today",
        newitems: foundItems
      });

    }

  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        res.redirect("/"+customListName);
        list.save();
      }
      else {
        res.render("list", {
          itemlists: foundList.name,
          newitems: foundList.items
        });
      }
    }
  });


});



app.post("/", function(req, res) {
  const newItem = req.body.newItem;
  const listname =req.body.list;
  const item = new Item({
    name: newItem
  });
  if(listname=="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,founditem){
      founditem.items.push(item);
      founditem.save();
      res.redirect("/"+listname);
    })
  }

});

app.post("/delete", function(req, res) {
  const checkItemid = req.body.checkbox;
  const listName= req.body.listName;

  if(listName=="Today"){
  Item.findByIdAndRemove(checkItemid, function(err) {
    if (!err) {
      res.redirect("/");
    }
  });}
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemid}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});


app.get("/work", function(req, res) {


  res.render("list", {
    itemlists: "work",
    newitems: worklist
  });

});

app.post("/work", function(req, res) {
  let newItem = req.body.newItem;
  worklist.push(newItem);
  res.redirect("/work");
});

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started at 3000");
});
