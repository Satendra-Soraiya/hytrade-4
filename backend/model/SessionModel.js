const { model } = require("mongoose");
const { SessionSchema } = require("../schemas/SessionSchema");

const SessionModel = model("Session", SessionSchema);

module.exports = { SessionModel };
