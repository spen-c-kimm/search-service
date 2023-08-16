import { Request } from 'express'

export interface Query {
  [key: string]: string
}

export interface InventorySearchRequest {
  query: { [key: string]: string }
  params: { [key: string]: string }
}

export interface InventoryResult {
  _source: {
    [key: string]: any
  }
}

export interface InventoryResponse {
  hits: {
    hits: InventoryResult[],
    total: { value: number }
  }
}

export interface Categories {
  [key: string]: {
    industry_category_id: string
    name: string
    count: number
    family_categories: {
      [key: string]: {
        family_category_id: string
        name: string
        count: number
        categories: {
          [key: string]: {
            category_id: string
            name: string
            count: number
          }
        }
      }
    }
  }
}

export interface Makes {
  [key: string]: {
    name: string
    count: number
    models: {
      [key: string]: {
        name: string
        count: number
      }
    }
  }
}

export interface Auctions {
  [key: string]: {
    auction: string,
    name: string
    count: number
  }
}