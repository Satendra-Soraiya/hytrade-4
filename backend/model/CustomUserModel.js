const { model } = require("mongoose");
const { CustomUserSchema } = require("../schemas/CustomUserSchema");

// Explicitly set the collection name to 'users' to match the existing collection
CustomUserSchema.set('collection', 'users');

const CustomUserModel = model("CustomUser", CustomUserSchema);

module.exports = { CustomUserModel };
