const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    picture: { type: String },
    provider: { type: String, enum: ["email", "google"], required: true },
    googleId: { type: String },
    passwordHash: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);

