import { ApolloLink, Observable } from 'apollo-client'
import { getOperationAST } from 'graphql'

/**
 * This is an adapter for Apollo Link that based on ApolloLink v2.
 * We can drop this piece of code and use The Graph Client adapter for Apollo Client v3.
 */
export class GraphClientApolloClientV2Link extends ApolloLink {
  graphClient$ = null

  constructor(getGraphClientFn) {
    super()
    this.graphClient$ = getGraphClientFn()
  }

  request(operation) {
    const operationAst = getOperationAST(
      operation.query,
      operation.operationName,
    )

    if (!operationAst) {
      throw new Error('GraphQL operation not found')
    }

    return new Observable(observer => {
      Promise.resolve()
        .then(async () => {
          const graphClient = await this.graphClient$
          try {
            if (operationAst.operation === 'subscription') {
              const subscriptionResult = await graphClient.subscribe(
                operation.query,
                operation.variables,
                operation.getContext(),
                {},
                operation.operationName,
              )
              if (Symbol.asyncIterator in subscriptionResult) {
                for await (const result of subscriptionResult) {
                  if (observer.closed) {
                    return
                  }
                  observer.next(result)
                }
                observer.complete()
              }
            } else {
              const result = await graphClient.execute(
                operation.query,
                operation.variables,
                operation.getContext(),
                {},
                operation.operationName,
              )

              if (!observer.closed) {
                observer.next(result)
                observer.complete()
              }
            }
          } catch (error) {
            if (!observer.closed) {
              observer.error(error)
            }
          }
        })
        .catch(error => {
          if (!observer.closed) {
            observer.error(error)
          }
        })
    })
  }
}
