const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const tagSchema = new mongoose.Schema({
    id: Number,  // This will be auto-incremented
    bookid: Number,
    tag: String
}, { collection: "Tags" });

// Apply auto-increment plugin
tagSchema.plugin(AutoIncrement, { inc_field: "id" });

module.exports = mongoose.model("Tags", tagSchema);