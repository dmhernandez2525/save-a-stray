import {
  FieldNode,
  FragmentDefinitionNode,
  GraphQLError,
  Kind,
  OperationDefinitionNode,
  SelectionSetNode,
  ValidationContext,
  ValidationRule,
} from 'graphql';

const DEFAULT_MAX_DEPTH = 8;
const DEFAULT_MAX_COMPLEXITY = 300;
const MAX_LIST_MULTIPLIER = 50;

const parseLimit = (
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number
): number => {
  if (!value) return fallback;
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsedValue));
};

export const GRAPHQL_LIMITS = {
  maxDepth: parseLimit(process.env.GRAPHQL_MAX_DEPTH, DEFAULT_MAX_DEPTH, 2, 25),
  maxComplexity: parseLimit(
    process.env.GRAPHQL_MAX_COMPLEXITY,
    DEFAULT_MAX_COMPLEXITY,
    50,
    5000
  ),
} as const;

const getListMultiplier = (fieldNode: FieldNode): number => {
  const argNames = ['first', 'last', 'limit'];
  const matchingArg = fieldNode.arguments?.find((arg) =>
    argNames.includes(arg.name.value)
  );
  if (!matchingArg || matchingArg.value.kind !== Kind.INT) {
    return 1;
  }

  const parsedValue = Number.parseInt(matchingArg.value.value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return 1;
  }
  return Math.min(parsedValue, MAX_LIST_MULTIPLIER);
};

const calculateDepth = (
  context: ValidationContext,
  selectionSet: SelectionSetNode,
  currentDepth: number,
  visitedFragments: Set<string>
): number => {
  let maxDepth = currentDepth;

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const nextDepth = currentDepth + 1;
      if (!selection.selectionSet) {
        maxDepth = Math.max(maxDepth, nextDepth);
        continue;
      }
      maxDepth = Math.max(
        maxDepth,
        calculateDepth(context, selection.selectionSet, nextDepth, visitedFragments)
      );
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      maxDepth = Math.max(
        maxDepth,
        calculateDepth(
          context,
          selection.selectionSet,
          currentDepth + 1,
          visitedFragments
        )
      );
      continue;
    }

    const fragmentName = selection.name.value;
    if (visitedFragments.has(fragmentName)) {
      continue;
    }

    const fragment = context.getFragment(fragmentName) as
      | FragmentDefinitionNode
      | undefined;
    if (!fragment) {
      continue;
    }

    visitedFragments.add(fragmentName);
    maxDepth = Math.max(
      maxDepth,
      calculateDepth(context, fragment.selectionSet, currentDepth + 1, visitedFragments)
    );
    visitedFragments.delete(fragmentName);
  }

  return maxDepth;
};

export const createDepthLimitRule = (maxDepth: number): ValidationRule => {
  const operationDepths = new WeakMap<OperationDefinitionNode, number>();

  return (context: ValidationContext) => ({
    OperationDefinition: {
      leave(node: OperationDefinitionNode) {
        const depth = calculateDepth(context, node.selectionSet, 0, new Set<string>());
        operationDepths.set(node, depth);

        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              `Query depth limit exceeded. Maximum depth is ${maxDepth}, received ${depth}.`,
              {
                nodes: node,
                extensions: {
                  code: 'QUERY_DEPTH_LIMIT_EXCEEDED',
                  maxDepth,
                  actualDepth: depth,
                },
              }
            )
          );
        }
      },
    },
  });
};

export const createComplexityLimitRule = (
  maxComplexity: number
): ValidationRule => {
  let currentComplexity = 0;

  return (context: ValidationContext) => ({
    OperationDefinition: {
      enter() {
        currentComplexity = 0;
      },
      leave(node: OperationDefinitionNode) {
        if (currentComplexity > maxComplexity) {
          context.reportError(
            new GraphQLError(
              `Query complexity limit exceeded. Maximum complexity is ${maxComplexity}, received ${currentComplexity}.`,
              {
                nodes: node,
                extensions: {
                  code: 'QUERY_COMPLEXITY_LIMIT_EXCEEDED',
                  maxComplexity,
                  actualComplexity: currentComplexity,
                },
              }
            )
          );
        }
      },
    },
    Field(node: FieldNode) {
      if (node.name.value.startsWith('__')) {
        return;
      }

      const listMultiplier = getListMultiplier(node);
      currentComplexity += listMultiplier;
    },
  });
};

export const createGraphQLValidationRules = (): ValidationRule[] => [
  createDepthLimitRule(GRAPHQL_LIMITS.maxDepth),
  createComplexityLimitRule(GRAPHQL_LIMITS.maxComplexity),
];
