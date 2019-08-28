import { startApp } from './app'
import Config from './config'
import { connectDB } from './middlewares/database'

connectDB(Config.database).then(startApp)
