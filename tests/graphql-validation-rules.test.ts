import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { parse, specifiedRules, validate } from 'graphql';
import '../server/models';
import schema from '../server/schema/schema';
import {
  createComplexityLimitRule,
  createDepthLimitRule,
  createGraphQLValidationRules,
} from '../server/graphql/validation-rules';

describe('graphql validation rules', () => {
  it('rejects queries over the configured depth limit', () => {
    const deepQuery = parse(`
      query TooDeep {
        animal(_id: "507f1f77bcf86cd799439011") {
          applications {
            animal {
              applications {
                animal {
                  applications {
                    _id
                  }
                }
              }
            }
          }
        }
      }
    `);

    const errors = validate(schema, deepQuery, [...specifiedRules, createDepthLimitRule(4)]);

    expect(errors.some((error) => error.extensions?.code === 'QUERY_DEPTH_LIMIT_EXCEEDED')).toBe(
      true
    );
  });

  it('rejects queries over the configured complexity limit', () => {
    const expensiveQuery = parse(`
      query TooComplex {
        a1: animalsConnection(first: 50) { edges { node { _id } } }
        a2: animalsConnection(first: 50) { edges { node { _id } } }
        a3: animalsConnection(first: 50) { edges { node { _id } } }
        a4: animalsConnection(first: 50) { edges { node { _id } } }
        a5: animalsConnection(first: 50) { edges { node { _id } } }
        a6: animalsConnection(first: 50) { edges { node { _id } } }
        a7: animalsConnection(first: 50) { edges { node { _id } } }
      }
    `);

    const errors = validate(schema, expensiveQuery, [
      ...specifiedRules,
      createComplexityLimitRule(300),
    ]);

    expect(
      errors.some((error) => error.extensions?.code === 'QUERY_COMPLEXITY_LIMIT_EXCEEDED')
    ).toBe(true);
  });

  it('creates depth and complexity rules together', () => {
    const rules = createGraphQLValidationRules();
    expect(rules).toHaveLength(2);
  });
});
