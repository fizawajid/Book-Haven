const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const trashSchema = new mongoose.Schema({
    bookId: Number,
    readerId: Number,
    deletedAt: { type: Date, default: Date.now },
    prevReadingStatus: String, // 👈 store original reading_status
}, { collection: "Trash" });

trashSchema.plugin(AutoIncrement, { inc_field: "trashId" });

module.exports = mongoose.model("Trash", trashSchema);
