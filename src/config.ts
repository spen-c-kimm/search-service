import dotenv from 'dotenv'

dotenv.config()

export const ELASTIC_HOST = process.env.ELASTIC_HOST
export const ELASTIC_PORT = process.env.ELASTIC_PORT

export const getDefaults = () => {
  return {
    closed: '0',
    halted: '0',
    endtime: `${new Date().getTime() / 1000}:`,
    page: '1',
    perPage: '50',
    sortBy: 'current_bid:DESC'
  }
}

export const SHOULD_MATCH_FIELDS = [
  'designation',
  'category',
]

export const MUST_MATCH_FIELDS = [
  'auction',
  'item',
  'closing',
  'closed',
  'seller',
  'city',
  'state_abbreviation'
]

export const MATCH_PHRASE_FIELDS = [
  'first_line_description',
  'family_category',
  'category',
  'first_line_description.synonyms',
  'family_category.synonyms',
  'category.synonyms'
]

export const MULTI_MATCH_FIELDS = [
  'make^10',
  'model^10',
  'family_category^10',
  'make.synonyms^10',
  'model.synonyms^10',
  'family_category.synonyms^10'
]

export const RANGE_FIELDS = ['endtime', 'current_bid', 'year']

export const GEO_DISTANCE_FIELDS = ['zipcode', 'range']

export const SORT_FIELDS = [
  'sortorder:ASC',
  'current_bid:ASC',
  'endtime:ASC',
  'sortorder:DESC',
  'current_bid:DESC',
  'endtime:DESC'
]

export const PAGINATION_FIELDS = ['page', 'perPage']
