import { ISourcingContext, IRemoteNode } from "../../../types"
import { collectListOperationNames } from "../node-definition-helpers"
import { paginate, planPagination } from "./paginate"
import { getGatsbyNodeDefinition } from "../node-definition-helpers"
import { addPaginatedFields } from "./fetch-node-fields"

/**
 * Fetches and paginates remote nodes by type while reporting progress
 */
export async function* fetchAllNodes(
  context: ISourcingContext,
  remoteTypeName: string
): AsyncIterable<IRemoteNode> {
  const { gatsbyApi, formatLogMessage } = context
  const { reporter } = gatsbyApi
  const nodeDefinition = getGatsbyNodeDefinition(context, remoteTypeName)

  const activity = reporter.activityTimer(
    formatLogMessage(`fetching ${nodeDefinition.remoteTypeName}`)
  )
  activity.start()

  try {
    const listOperations = collectListOperationNames(nodeDefinition.document)

    for (const nodeListQuery of listOperations) {
      const nodes = fetchNodeList(context, remoteTypeName, nodeListQuery)
      for await (const node of nodes) {
        yield node
      }
    }
  } finally {
    activity.end()
  }
}

export async function* fetchNodeList(
  context: ISourcingContext,
  remoteTypeName: string,
  listOperationName: string
): AsyncIterable<IRemoteNode> {
  const nodeDefinition = getGatsbyNodeDefinition(context, remoteTypeName)
  const plan = planPagination(nodeDefinition.document, listOperationName)

  for await (const page of paginate(context, plan)) {
    const partialNodes = plan.strategy.getItems(page.fieldValue)

    for (const node of partialNodes) {
      // TODO: run in parallel?
      yield addPaginatedFields(context, nodeDefinition, node)
    }
  }
}
