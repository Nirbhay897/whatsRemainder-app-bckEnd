// import dotenv from 'dotenv'
// import express  from "express";
// import cors from 'cors'
// import bodyParser from "body-parser";
// import mongoose from "mongoose";
// import client from 'twilio'
// import twilio from 'twilio';

const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

dotenv.config()
const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())

const url = process.env.URL


mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, () => console.log("connected to db"))
        


// mongoose.set('autoCreate', false)

const RemSchema = new mongoose.Schema({
    reminderMesg: String,
    remindAt: String,
    isRemined: Boolean
})

const Reminder = new mongoose.model('remainder', RemSchema)

setInterval(() => {
    Reminder.find({}, (err, reminderList) => {
        if(err) {
            console.log(err)
        }
        if(reminderList){
            reminderList.forEach(reminder => {
                if(!reminder.isRemined){
                    const now = new Date()
                    if((new Date(reminder.remindAt) - now) < 0) {
                        Reminder.findByIdAndUpdate(reminder._id, {isRemined: true}, (err, remindObj)=>{
                            if(err){
                                console.log(err)
                            }
                            const accountSid = process.env.ACCOUNT_SID 
                            const authToken = process.env.AUTH_TOKEN
                
                            
                            // const client = twilio(accountSid, authToken)
                            const client = require('twilio')(accountSid, authToken); 
                            client.messages 
                            
                                .create({ 
                                     body: reminder.reminderMesg, 
                                     from:'whatsapp:+14155238886',       
                                     to:'whatsapp:+919205947168' 
                                }) 
                                .then(message => console.log(message.sid)) 
                                .done()
                        })
                    }
                }
            })
        }
    })
},1000)




app.get('/getdata', (req, res)=>{

    Reminder.find({}, (err, remainderList)=>{
        if(err){
            console.log(err);
        }
        if(remainderList){
            res.send(remainderList)
        }
    })
})

app.post('/Postdata', (req, res)=>{
    const {reminderMesg, remindAt} = req.body
    const reminder = new Reminder({
        reminderMesg,
        remindAt,
        isRemined: false
    })
    reminder.save(err=>{
        if(err){
            console.log(err)
        }
        Reminder.find({}, (err, remainderList)=>{
            if(err){
                console.log(err);
            }
            if(remainderList){
                res.send(remainderList)
            }
        })
    })
})

app.post('/deleteData', (req, res)=>{
    
        Reminder.deleteOne({_id: req.body.id}, ()=>{
            Reminder.find({}, (err, remainderList)=>{
                if(err){
                    console.log(err);
                }
                if(remainderList){
                    res.send(remainderList)
                }
            })
        })
})



const PORT = 5000
app.listen(PORT, (err)=>{
    if(!err) console.log("server is running at port 5000");
})