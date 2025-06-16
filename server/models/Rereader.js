const mongoose = require('mongoose');
const AutoIncrement = require("mongoose-sequence")(mongoose);
const rereaderSchema = new mongoose.Schema({
    reread_id: { type: Number, unique: true }, // numeric ID
    bookid: { type: Number, required: true },            // from Book.bookid
    startDate: String,
    endDate: String
}, { collection: "Rereader" });
rereaderSchema.plugin(AutoIncrement, { inc_field: "reread_id" });
module.exports = mongoose.model('Rereader', rereaderSchema);
