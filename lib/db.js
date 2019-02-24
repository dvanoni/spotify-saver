const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json', {
  defaultValue: {
    credentials: {},
    currentTrack: {
      id: null,
      isSaved: false,
    },
  }
})

const db = low(adapter)

module.exports = db
