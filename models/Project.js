const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  projectName: {type: String, required: true},
  repository: {type: String},
  description: { type: String},
  date: {type: Date, default: Date.now},
  status: {type: String},
  teams: [[{type: Types.ObjectId, ref: 'Developer'}], [{type: Types.ObjectId, ref: 'Security'}], [{type: Types.ObjectId, ref: 'Operator'}]],
  owner: {type: Types.ObjectId, ref: 'SA'}
})

module.exports = model('Project', schema)