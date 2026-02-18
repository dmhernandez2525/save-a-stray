import { GraphQLError, GraphQLScalarType, Kind, ValueNode } from 'graphql';
import validator from 'validator';

const parseStringLiteral = (ast: ValueNode): string => {
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError('Expected a string literal.');
  }
  return ast.value;
};

const asString = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new GraphQLError('Expected a string value.');
  }
  return value;
};

const parseDate = (value: unknown): Date => {
  const rawValue = asString(value);
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new GraphQLError('Invalid ISO date value.');
  }
  return parsed;
};

export const EmailScalar = new GraphQLScalarType({
  name: 'Email',
  description: 'RFC-compliant email address scalar.',
  serialize(value: unknown): string {
    const email = asString(value);
    if (!validator.isEmail(email)) {
      throw new GraphQLError('Invalid email address.');
    }
    return email;
  },
  parseValue(value: unknown): string {
    const email = asString(value).trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new GraphQLError('Invalid email address.');
    }
    return email;
  },
  parseLiteral(ast: ValueNode): string {
    const email = parseStringLiteral(ast).trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new GraphQLError('Invalid email address.');
    }
    return email;
  },
});

export const URLScalar = new GraphQLScalarType({
  name: 'URL',
  description: 'Absolute URL scalar (http/https).',
  serialize(value: unknown): string {
    const url = asString(value);
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new GraphQLError('Invalid URL value.');
    }
    return url;
  },
  parseValue(value: unknown): string {
    const url = asString(value).trim();
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new GraphQLError('Invalid URL value.');
    }
    return url;
  },
  parseLiteral(ast: ValueNode): string {
    const url = parseStringLiteral(ast).trim();
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new GraphQLError('Invalid URL value.');
    }
    return url;
  },
});

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'ISO 8601 date-time scalar.',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new GraphQLError('Invalid date value.');
      }
      return value.toISOString();
    }

    const parsed = parseDate(String(value));
    return parsed.toISOString();
  },
  parseValue(value: unknown): Date {
    return parseDate(value);
  },
  parseLiteral(ast: ValueNode): Date {
    return parseDate(parseStringLiteral(ast));
  },
});
