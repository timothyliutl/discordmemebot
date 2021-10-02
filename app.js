require('dotenv').config()

//instagram setup

const Instagram = require('instagram-web-api')
const instagramClient = new Instagram({username:"applememes23", password:process.env.INSTAGRAMPASSWORD})
instagramClient.login().catch((err)=>{
    console.log(err)
})



//database set up
const { MongoClient } = require('mongodb');
const mongourl = "mongodb+srv://admin:" + process.env.DBKEY +"@cluster0.udcne.mongodb.net/MemePosts?retryWrites=true&w=majority"
const mongoose = require('mongoose')

mongoose.connect(mongourl, {useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

var Schema = mongoose.Schema;

var MemeSchema = new Schema({
    attachmentname: String,
    user: String,
    attachmenturl: String,
    type: String,
    messagetext: String,
    timeposted: Date,
    messageID: String,
    userID: String,
    upvotes: [String]
})

var PostedSchema = new Schema({
    attachmentname: String,
    upvotes:[String]
})

var MemeModel = mongoose.model('MemeModel', MemeSchema);
var PostedModel = mongoose.model("PostedModel", PostedSchema);



//discord stuff
const token = process.env.KEY

const { Client, Intents, Permissions} = require('discord.js');
const { connect } = require('http2');
const { stringify } = require('querystring');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]})

client.login(token).catch(function(err){
    console.log(err)
})
client.on('messageCreate', (message)=>{
    if(message.channelId!="893603222084800542"){
        return
    }
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
        if(!message.content.toUpperCase().includes("MEME:")){
            return;
        }


        attachments = []

        for(let [key, value] of message.attachments){
            let fileExt = value.attachment.split('.').at(-1);
            if(fileExt!="jpg"&&fileExt!="mp4"){
                message.reply("Invalid file type! Only JPG and MP4 are allowed.")
                return;
            }
            var today = new Date()
            attachments.push({
                attachmentname: value.name,
                user: message.author.username,
                attachmenturl: value.attachment,
                type: value.attachment.split(".").at(-1),
                messagetext: message.content.split("meme:").pop(),
                timeposted: today,
                messageID: message.id,
                userID: message.author.id,
                upvotes:[]
            })
        }
        console.log(attachments[0]);
        for(var i=0; i<attachments.length; i++){
            var document = new MemeModel(attachments[i])
            document.save((error, doc)=>{
                if(error){
                    console.log(doc)
                }
            });
         message.reply("Meme Recieved! Awaiting admin approval.")

        const reactionFilter = (reaction, user)=>{
            const adminList = message.guild.roles.cache.get("893720969435283466").members.map(m=>m.user.id)
            
            console.log(adminList)
            var document2 = new PostedModel({
                attachmentname: attachments[0].attachmenturl,
                upvotes: [user.id]
            })
            document2.save((err,doc)=>{
                if(err){
                    console.log(doc)
                }
            })
            return (reaction.emoji.name === '🍎'&& adminList.includes(user.id))
        }

        const reactionCollector = message.createReactionCollector({filter: reactionFilter, max: 1})
        reactionCollector.on('collect', (reaction, user)=>{
            //incase we want to have a democracy again
        })
        reactionCollector.on('end', (reaction,user)=>{
            message.reply("Meme has been approved")

            instagramClient.uploadPhoto({photo:attachments[0].attachmenturl, caption:attachments[0].messagetext, post:'feed'}).catch((err)=>{
                console.log(err)
            })
            
        })
         
         
        }

        //just to test out the photo upload ability
        
    }



});
client.on('ready', ()=>{
    console.log('bot is now ready')
})


