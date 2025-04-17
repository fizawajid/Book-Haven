const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const readerSchema = new mongoose.Schema({
    reader_id: Number,  // This will be auto-incremented
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String, 
    date_of_birth: Date,
    profilePicUrl: { type: String, default: "" } 
}, { collection: "Reader" });

// Apply auto-increment plugin
readerSchema.plugin(AutoIncrement, { inc_field: "reader_id" });

module.exports = mongoose.model("Reader", readerSchema);