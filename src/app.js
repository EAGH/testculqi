import mongoose from "mongoose";
const db = await mongoose.connect("mongodb://mongo/testculqi")
console.log('Name data base mongo: ', db.connection.db.databaseName)