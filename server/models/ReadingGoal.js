const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ReadingGoalSchema = new mongoose.Schema({
  goal_id: { type: Number, unique: true },
  reader_id: { type: Number, required: true },
  year_start: { type: String, required: true },
  year_end: { type: String, required: true },
  yearly_goal: { type: Number, required: true },
  yearly_progress: { type: Number, required: true },
  month_start: { type: String, required: true },
  month_end: { type: String, required: true },
  monthly_goal: { type: Number, required: true },
  monthly_progress: { type: Number, required: true },
  week_start: { type: String, required: true },
  week_end: { type: String, required: true },
  weekly_goal: { type: Number, required: true },
  weekly_progress: { type: Number, required: true }
}, { collection: "ReadingGoal" });

ReadingGoalSchema.plugin(AutoIncrement, { inc_field: "goal_id" });
// Create and export the model
module.exports = mongoose.model("ReadingGoal", ReadingGoalSchema);
