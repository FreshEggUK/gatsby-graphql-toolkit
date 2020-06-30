import { ISourcingConfig, ISourcingContext } from "../types"
import { defaultGatsbyFieldAliases } from "../config/default-gatsby-field-aliases"
import { createNodeIdTransform } from "../config/node-id-transform"
import { createTypeNameTransform } from "../config/type-name-transform"
import { formatLogMessage } from "../utils/format-log-message"
import { PaginationAdapters } from "../config/pagination-adapters"

export function createSourcingContext(
  config: ISourcingConfig
): ISourcingContext {
  const gatsbyFieldAliases =
    config.gatsbyFieldAliases ?? defaultGatsbyFieldAliases

  const {
    gatsbyApi,
    idTransform = createNodeIdTransform(gatsbyFieldAliases),
    typeNameTransform = createTypeNameTransform(config.gatsbyTypePrefix),
    paginationAdapters = PaginationAdapters,
  } = config
  const { reporter } = gatsbyApi
  const format = string => formatLogMessage(string)

  return {
    ...config,
    gatsbyFieldAliases,
    idTransform,
    typeNameTransform,
    paginationAdapters,
    formatLogMessage: format,
    fetchingActivity: reporter.activityTimer(format(`fetching nodes`)),
    creatingActivity: reporter.activityTimer(format(`creating nodes`)),
  }
}