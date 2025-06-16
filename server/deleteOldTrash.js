// deleteOldTrash.js
const Trash = require("./models/Trash");
const Book = require("./models/Book");
const Tag = require("./models/Tag");
const Favorite = require("./models/Favorite");
const LendingTracker = require("./models/LendingTracker");
const Rereader = require("./models/Rereader");
const Quote = require("./models/Quote");
async function deleteOldTrash() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    console.log("30 days ago: ",thirtyDaysAgo);
    const oldEntries = await Trash.find({ deletedAt: { $lt: thirtyDaysAgo } });

    for (const entry of oldEntries) {
        await Book.deleteOne({ bookid: entry.bookId });
        await Favorite.deleteOne({ bookId: entry.bookId });
        await Tag.deleteMany({ bookid: entry.bookId });
        await LendingTracker.deleteOne({ bookId: entry.bookId });
        await Rereader.deleteMany({ bookid: entry.bookId });
        await Quote.deleteMany({ bookId: entry.bookId });
        await Trash.deleteOne({ trashId: entry.trashId });
    }
    console.log("Old trash cleaned up");
}

module.exports = deleteOldTrash;
