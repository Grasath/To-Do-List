const express = require("express");
const bodyParser = require("body-parser");
const date = require(`${__dirname}/date.js`)
const path = require("path");
const ejs = require("ejs");
const app = express();
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set('views', __dirname +"/views");
app.use(express.static("public"));
dotenv.config();

async function main(){
    const password = encodeURIComponent(process.env.password);
    const database = encodeURIComponent(process.env.database);
    const url = `mongodb+srv://Mister_Idler:${password}@cluster0.9wwqabz.mongodb.net/${database}?retryWrites=true&w=majority`;
    await mongoose.connect(url);
}
main().catch(err => console.log(err));

const itemSchema = new mongoose.Schema({
    name : String
});

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const Item = mongoose.model('Item',itemSchema);
const List = mongoose.model('List',listSchema);

const item1 = new Item({
    name : 'Welcome to your todolist!'
});

const item2 = new Item({
    name : 'Hit the "+" button to add new item.'
});

const item3 = new Item({
    name : '<-- Hit this to delete  an item.'
});

const defaultItems = [item1,item2,item3];
const insertDefaultItems = async()=>{
    await Item.insertMany(defaultItems);
}

const insertNewItem = async (item)=>{
    const newItem = new Item({
        name : item
    });
    await newItem.save();
}

const insertNewList = async (listName, itemArray)=>{
    const newList = new List({
        name : listName,
        items : itemArray
    });
    await newList.save();
}

const findByIdAndDelete = async(id)=>{
    await Item.findByIdAndDelete({_id : id});
}

let today = date.getDate();
app.get("/",(req,res)=>{  
    const findItems = async()=>{
        const items = await Item.find({}).maxTimeMS(20000).exec();
        if (items.length === 0){
            insertDefaultItems().catch(err => console.log(err));
            res.redirect('/');
        }else{
            res.render('list',{Title : today ,Items : items} );
        }
        
        
    }
    findItems().catch(err => console.log(err)); 
   
})
app.get("/:paramName",(req,res)=>{
    const customListName = _.capitalize(req.params.paramName);
    const findList = async()=>{
        const lists = await List.findOne({name : customListName});
        if (!lists){
            insertNewList(customListName,defaultItems).catch(err=>console.log(err));
            res.redirect(`/${customListName}`)
        }else{
            res.render('list',{Title : customListName ,Items : lists.items})
        }
    }
    findList().catch(err=>console.log(err));

    
})

app.post("/",(req,res)=>{
    let newItem = req.body.newOne;
    let listName = req.body.list;
    if(listName === today){
        insertNewItem(newItem).catch(err=> console.log(err));
        res.redirect("/");
    }else{
        const run = async()=>{
            const foundList = await List.findOne({name : listName});
            const addItem = new Item({
                name : newItem
            })
            foundList.items.push(addItem);
            foundList.save()            

        }
        run().catch(err=> console.log(err))
        res.redirect(`/${listName}`)
    }
    
    

    
})
app.post('/delete',(req,res)=>{
    const checkedItemId = req.body.checkedItem;
    const listName = req.body.list;
    if (listName === today){
        findByIdAndDelete(checkedItemId).catch(err=>console.log(err));
        res.redirect('/');
    }else{
        const run = async()=>{
            await List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}})
        }
        run().catch(err => console.log(err));
        res.redirect(`/${listName}`);
    }
    
})

app.get("/about",(req,res)=>{
    res.render("about");
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})