import express from 'express'
import { getAuction } from './auction'
import { search, filters } from './inventory'
import logger from './logger'

const app = express()
app.use(express.json())

app.get('/v1/test/search', search)
app.get('/v1/test/filters', filters)
app.get('/v1/test/auction/:auction', getAuction)

app.listen(1323, () => logger.info(`Listening on port: ${1323}`))