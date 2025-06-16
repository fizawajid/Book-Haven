const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcryptjs");

const readerSchema = new mongoose.Schema({
    reader_id: Number,  // This will be auto-incremented
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String, 
    date_of_birth: Date,
    profilePicUrl: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },  // New field for admin status
    last_login: { type: Date, default: null }  // New field for last login date
}, { collection: "Reader" });

// Apply auto-increment plugin
readerSchema.plugin(AutoIncrement, { inc_field: "reader_id" });

// Hash password before saving
readerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
module.exports = mongoose.model("Reader", readerSchema);
