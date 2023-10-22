const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pollManagement = new Schema({
  title: { type: String},
  description:{type:String},
  options:[{optionTitle:{type:String},voters:[{type:String,ref:'user'}]}],
  usersVoted:[{type:String,ref:'user'}]
},{timestamps:true})

module.exports = mongoose.model('pollManagement', pollManagement)
