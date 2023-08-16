import {
  MATCH_PHRASE_FIELDS,
  MULTI_MATCH_FIELDS,
  SHOULD_MATCH_FIELDS,
  MUST_MATCH_FIELDS,
  RANGE_FIELDS,
  PAGINATION_FIELDS,
  SORT_FIELDS
} from '../config'
import Elastic from '../elastic'
import { InventoryResult, Query, Categories, Makes, Auctions } from '../types'

const parseQueryData = (fields: string[], data: Query) => {
  return fields.reduce((result: Query, field: string) => {
    if (data.hasOwnProperty(field)) result[field] = data[field]
    return result
  }, {})
}

const buildMust = (data: Query) => {
  const rangeFields: Query = parseQueryData(RANGE_FIELDS, data)
  const mustMatchFields: Query = parseQueryData(MUST_MATCH_FIELDS, data)
  const { category, designation }: Query = parseQueryData(SHOULD_MATCH_FIELDS, data)

  const categories = category ? category.split(',') : []
  const shouldMatch = categories.map(category => {
    return {
      term: {
        "category.raw": category
      }
    }
  })

  const designations = designation ? designation.split(',') : []
  const shoulMatchCombo = designations.map(designation => {
    const [make, model] = designation.split(':')
    return {
      bool: {
        must: [
          {
            term: {
              "make.raw": make
            }
          },
          {
            term: {
              "model.raw": model
            }
          }
        ]
      }
    }
  })

  const mustMatches = Object.entries(mustMatchFields).map(([field, value]) => {
    return {
      term: {
        [field]: value
      }
    }
  })

  const shouldMatches = {
    bool: {
      should: [...shouldMatch, ...shoulMatchCombo]
    }
  }

  const ranges = Object.entries(rangeFields).map(([field, value]) => {
    const [gt, lt] = value.split(':')
    return {
      range: {
        [field]: {
          gt: Number(gt) || null,
          lt: Number(lt) || null
        }
      }
    }
  })

  return [...mustMatches, shouldMatches, ...ranges]
}

const buildShould = (searchTerm: string) => {
  if (searchTerm) {
    const multiMatch = {
      multi_match: {
        query: searchTerm,
        fields: MULTI_MATCH_FIELDS,
        fuzziness: "AUTO"
      }
    }

    const matchPhrases = MATCH_PHRASE_FIELDS.map(field => {
      return {
        match_phrase: {
          [field]: {
            query: searchTerm,
            slop: 50,
            boost: 10
          }
        }
      }
    })

    return [...matchPhrases, multiMatch]
  }
}

const buildFilter = async (data: Query) => {
  const { zipcode, range } = data

  if (zipcode && range) {
    const response = await Elastic.get({ id: zipcode, index: 'postal' })
    const { latitude, longitude } = response._source as { latitude: string, longitude: string }

    return {
      geo_distance: {
        distance: `${range}mi`,
        distance_type: "plane",
        location: {
          lat: Number(latitude),
          lon: Number(longitude)
        }
      }
    }
  }
}

const buildSort = (searchTerm: string, data: Query) => {
  const { sortBy } = data

  if (!searchTerm && SORT_FIELDS.includes(sortBy)) {
    const [field, order] = sortBy.split(':')

    return [
      {
        [field]: {
          order
        }
      }
    ]
  }
}

export const buildOptions = async (searchTerm: string, data: Query) => {
  const { page, perPage } = parseQueryData(PAGINATION_FIELDS, data)
  const must = buildMust(data)
  const should = buildShould(searchTerm)
  const filter = await buildFilter(data)
  const sort = buildSort(searchTerm, data)


  return {
    index: 'inventory',
    size: Number(perPage),
    min_score: searchTerm ? 20 : undefined,
    from: (Number(page) - 1) * Number(perPage),
    query: {
      bool: {
        must,
        should,
        filter
      }
    },
    sort
  }
}

export const parseFilters = (items: InventoryResult[]) => {
  const categories: Categories = {}
  const makes: Makes = {}
  const auctions: Auctions = {}

  for (const { _source } of items) {
    const {
      category_id,
      family_category_id,
      industry_category_id,
      category,
      family_category,
      industry_category,
      make,
      model,
      auction,
      title
    } = _source

    if (!auction[auction]) {
      auctions[auction] = {
        auction,
        name: title,
        count: 1
      }
    } else {
      auctions[auction].count++
    }

    if (!makes[make]) {
      makes[make] = {
        name: make,
        count: 1,
        models: {
          [model]: {
            name: model,
            count: 1
          }
        }
      }
    } else {
      makes[make].count++

      if (!makes[make].models[model]) {
        makes[make].models[model] = {
          name: model,
          count: 1
        }
      } else {
        makes[make].models[model].count++
      }
    }

    if (!categories[industry_category_id]) {
      categories[industry_category_id] = {
        industry_category_id,
        name: industry_category,
        count: 1,
        family_categories: {
          [family_category_id]: {
            family_category_id,
            name: family_category,
            count: 1,
            categories: {
              [category_id]: {
                category_id,
                name: category,
                count: 1
              }
            }
          }
        }
      }
    } else {
      categories[industry_category_id].count++

      if (
        !categories[industry_category_id].family_categories[family_category_id]
      ) {
        categories[industry_category_id].family_categories[family_category_id] =
        {
          family_category_id,
          name: family_category,
          count: 1,
          categories: {
            [category_id]: {
              category_id,
              name: category,
              count: 1
            }
          }
        }
      } else {
        categories[industry_category_id].family_categories[family_category_id]
          .count++

        if (
          !categories[industry_category_id].family_categories[
            family_category_id
          ].categories[category_id]
        ) {
          categories[industry_category_id].family_categories[
            family_category_id
          ].categories[category_id] = {
            category_id,
            name: category,
            count: 1
          }
        } else {
          categories[industry_category_id].family_categories[family_category_id]
            .categories[category_id].count++
        }
      }
    }
  }

  return { categories, makes }
}