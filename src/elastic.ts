import { Client } from '@elastic/elasticsearch'
import { ELASTIC_HOST, ELASTIC_PORT } from './config'

const Elastic = new Client({ node: `http://${ELASTIC_HOST}:${ELASTIC_PORT}` })

export default Elastic
