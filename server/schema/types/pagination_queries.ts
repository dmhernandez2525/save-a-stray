import {
  GraphQLError,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { ApplicationDocument } from '../../models/Application';
import { AnimalDocument } from '../../models/Animal';
import { ShelterDocument } from '../../models/Shelter';
import { decodeCursor, encodeCursor, toObjectId } from '../../services/cursor';
import { ApplicationConnectionType, AnimalConnectionType } from './connection_types';

const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');

const DEFAULT_FIRST = 20;
const MAX_FIRST = 50;

interface ConnectionEdge<TNode> {
  cursor: string;
  node: TNode;
}

interface ConnectionResponse<TNode> {
  edges: ConnectionEdge<TNode>[];
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
  totalCount: number;
}

interface AnimalConnectionArgs {
  first?: number;
  after?: string;
  status?: string;
  type?: string;
  shelterId?: string;
}

interface ApplicationConnectionArgs {
  first?: number;
  after?: string;
  status?: string;
  userId?: string;
  shelterId?: string;
}

const clampFirst = (first: number | undefined): number => {
  if (first === undefined || Number.isNaN(first)) {
    return DEFAULT_FIRST;
  }
  if (first < 1) {
    return 1;
  }
  return Math.min(first, MAX_FIRST);
};

const invalidCursorError = (): GraphQLError =>
  new GraphQLError('Invalid cursor provided.', {
    extensions: { code: 'BAD_USER_INPUT' },
  });

const applyAfterCursorToIdFilter = (
  existingFilter: Record<string, unknown> | undefined,
  afterId: Types.ObjectId
): Record<string, unknown> => ({
  ...(existingFilter ?? {}),
  $lt: afterId,
});

const emptyConnection = <TNode>(): ConnectionResponse<TNode> => ({
  edges: [],
  pageInfo: {
    endCursor: null,
    hasNextPage: false,
  },
  totalCount: 0,
});

export const paginationQueryFields: GraphQLFieldConfigMap<unknown, unknown> = {
  animalsConnection: {
    type: AnimalConnectionType,
    description:
      'Cursor-based paginated animal listing for public search and dashboard views.',
    args: {
      first: { type: GraphQLInt },
      after: { type: GraphQLString },
      status: { type: GraphQLString },
      type: { type: GraphQLString },
      shelterId: { type: GraphQLID },
    },
    async resolve(
      _,
      args: AnimalConnectionArgs
    ): Promise<ConnectionResponse<AnimalDocument>> {
      const first = clampFirst(args.first);
      const baseFilter: FilterQuery<AnimalDocument> = {};

      if (args.status) {
        baseFilter.status = args.status;
      }
      if (args.type) {
        baseFilter.type = args.type;
      }

      if (args.shelterId) {
        const shelter = await Shelter.findById(args.shelterId);
        const shelterAnimalIds = shelter?.animals?.map((id) => id.toString()) ?? [];
        if (shelterAnimalIds.length === 0) {
          return emptyConnection<AnimalDocument>();
        }
        baseFilter._id = { $in: shelterAnimalIds.map((id) => new Types.ObjectId(id)) };
      }

      const pagedFilter: FilterQuery<AnimalDocument> = { ...baseFilter };

      if (args.after) {
        const decodedCursor = decodeCursor(args.after);
        if (!decodedCursor) {
          throw invalidCursorError();
        }
        const afterObjectId = toObjectId(decodedCursor);
        if (!afterObjectId) {
          throw invalidCursorError();
        }

        const currentIdFilter =
          (pagedFilter._id as Record<string, unknown> | undefined) ?? undefined;
        pagedFilter._id = applyAfterCursorToIdFilter(currentIdFilter, afterObjectId);
      }

      const [records, totalCount] = await Promise.all([
        Animal.find(pagedFilter).sort({ _id: -1 }).limit(first + 1),
        Animal.countDocuments(baseFilter),
      ]);

      const hasNextPage = records.length > first;
      const nodes = hasNextPage ? records.slice(0, first) : records;
      const edges = nodes.map((node) => ({
        cursor: encodeCursor(node._id.toString()),
        node,
      }));
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
        totalCount,
      };
    },
  },
  applicationsConnection: {
    type: ApplicationConnectionType,
    description:
      'Cursor-based paginated applications with optional shelter and user filtering.',
    args: {
      first: { type: GraphQLInt },
      after: { type: GraphQLString },
      status: { type: GraphQLString },
      userId: { type: GraphQLID },
      shelterId: { type: GraphQLID },
    },
    async resolve(
      _,
      args: ApplicationConnectionArgs
    ): Promise<ConnectionResponse<ApplicationDocument>> {
      const first = clampFirst(args.first);
      const baseFilter: FilterQuery<ApplicationDocument> = {};

      if (args.status) {
        baseFilter.status = args.status;
      }
      if (args.userId) {
        baseFilter.userId = args.userId;
      }

      if (args.shelterId) {
        const shelter = await Shelter.findById(args.shelterId);
        const shelterAnimalIds = shelter?.animals?.map((id) => id.toString()) ?? [];
        if (shelterAnimalIds.length === 0) {
          return emptyConnection<ApplicationDocument>();
        }
        baseFilter.animalId = { $in: shelterAnimalIds };
      }

      const pagedFilter: FilterQuery<ApplicationDocument> = { ...baseFilter };

      if (args.after) {
        const decodedCursor = decodeCursor(args.after);
        if (!decodedCursor) {
          throw invalidCursorError();
        }
        const afterObjectId = toObjectId(decodedCursor);
        if (!afterObjectId) {
          throw invalidCursorError();
        }

        const currentIdFilter =
          (pagedFilter._id as Record<string, unknown> | undefined) ?? undefined;
        pagedFilter._id = applyAfterCursorToIdFilter(currentIdFilter, afterObjectId);
      }

      const [records, totalCount] = await Promise.all([
        Application.find(pagedFilter).sort({ _id: -1 }).limit(first + 1),
        Application.countDocuments(baseFilter),
      ]);

      const hasNextPage = records.length > first;
      const nodes = hasNextPage ? records.slice(0, first) : records;
      const edges = nodes.map((node) => ({
        cursor: encodeCursor(node._id.toString()),
        node,
      }));
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
        totalCount,
      };
    },
  },
  applicationConnectionById: {
    type: ApplicationConnectionType,
    description:
      'Compatibility alias that maps to applicationsConnection for older clients.',
    args: {
      first: { type: GraphQLInt },
      after: { type: GraphQLString },
      status: { type: GraphQLString },
      userId: { type: GraphQLID },
      shelterId: { type: GraphQLID },
    },
    deprecationReason: 'Use applicationsConnection instead.',
    resolve(_, args: ApplicationConnectionArgs) {
      return (paginationQueryFields.applicationsConnection.resolve as (
        source: unknown,
        connectionArgs: ApplicationConnectionArgs
      ) => Promise<ConnectionResponse<ApplicationDocument>>)(_, args);
    },
  },
  cursorEcho: {
    type: GraphQLString,
    description: 'Debug helper for cursor encoding validation.',
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve(_, args: { id: string }) {
      return encodeCursor(args.id);
    },
  },
};
