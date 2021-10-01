require('dotenv').config()


//database set up
const { MongoClient } = require('mongodb');
const mongourl = "mongodb+srv://admin:" + process.env.DBKEY +"@cluster0.udcne.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const mongoClient = new MongoClient(mongourl)

//discord stuff
const token = process.env.KEY
const { Client, Intents } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]})

client.login(token).catch(function(err){
    console.log(err)
})
client.on('messageCreate', (message)=>{
    console.log(message.content)
    if(message.author.bot){
        return false;
    }
    //code to set up memes channel might not need to do this if its only going to be on one server
    if(message.content.includes("memebot set channel")){
        let channelid = message.split("memebot set channel").pop();
        message.channel.send("Channel " + channelid + " set successfully")
    }
    if(message.content=="hello"){
        message.channel.send("Hello")
    }

    if(message.attachments.size>0){
        console.log(message)
        message.channel.send("attachment recieved")
        
    }



});
client.on('ready', ()=>{
    console.log('bot is now ready')
})


