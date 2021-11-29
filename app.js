const cors = require('cors')
const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const app = express()
const corsMiddleware = require('./middleware/cors.middleware')
const PORT = process.env.PORT || config.get('port')

app.use(corsMiddleware)
app.use(cors({ credentials: true, origin: true }))
app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/projects', require('./routes/project.routes'))
app.use('/api/users', require('./routes/user.routes'))


const start = async () => {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
  } catch (e) {
    console.log('Server Error', e.message)
    process.exit(1)
  }
}

start()