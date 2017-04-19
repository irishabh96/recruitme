const mongoose = require('mongoose'),
      Schema = mongoose.Schema;


const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User'}],
  jobId: { type: [Schema.Types.ObjectId], ref: 'Jobs'},
  lastMessageAuthor: { type: Schema.Types.ObjectId, ref: 'User'},
  lastMessage: {type: String},
  lastMessageTimeStamp: {type: Date}
});

module.exports = mongoose.model('Conversation', ConversationSchema);
