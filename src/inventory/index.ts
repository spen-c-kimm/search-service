import { Response } from 'express'
import Elastic from '../elastic'
import logger from '../logger'
import { InventoryResponse, InventorySearchRequest } from '../types'
import { buildOptions, parseFilters } from './helpers'
import { getDefaults } from '../config'

export const search = async (req: InventorySearchRequest, res: Response) => {
  try {
    const { searchTerm, ...query } = req.query
    const defaults = getDefaults()
    const data = { ...defaults, ...query }

    const options = await buildOptions(searchTerm, data)

    const response = await Elastic.search(options) as InventoryResponse

    const { hits, total } = response.hits

    return res.status(200).send({ hits, total: total.value })
  } catch (error) {
    logger.error('inventory search', error)
    return res.status(500).send()
  }
}

export const filters = async (req: InventorySearchRequest, res: Response) => {
  try {
    const { searchTerm } = req.query
    const defaults = getDefaults()

    const options = await buildOptions(searchTerm, defaults)

    const response = await Elastic.search({ ...options, size: 10000 }) as InventoryResponse

    const filters = parseFilters(response.hits.hits)

    return res.status(200).send(filters)
  } catch (error) {
    logger.error('inventory search', error)
    return res.status(500).send()
  }
}
