import { Request, Response } from 'express'
import Elastic from '../elastic'
import logger from '../logger'

export const getAuction = async (req: Request, res: Response) => {
    try {
        const { auction } = req.params
        const response = await Elastic.get({ index: 'auction', id: auction })

        return res.status(200).send(response)
    } catch (error) {
        logger.error('getAuction', error)
        return res.status(500).send()
    }
}