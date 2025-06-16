const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);

const favoriteSchema = new mongoose.Schema({
    bookId: Number,
    readerId: Number,
  status: String,
},{ collection: "Favorite" });

favoriteSchema.plugin(AutoIncrement, { inc_field: "favoriteId" });
module.exports = mongoose.model('Favorite', favoriteSchema);