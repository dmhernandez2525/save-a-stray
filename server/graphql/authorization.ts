import mongoose from 'mongoose';
import { GraphQLContext } from './context';
import { ShelterDocument } from '../models/Shelter';

const Shelter = mongoose.model<ShelterDocument>('shelter');

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Throws if the user is not authenticated.
 * Use this for any mutation that requires a logged-in user.
 */
export const requireAuth = (context: GraphQLContext): string => {
  if (!context.userId) {
    throw new AuthorizationError('You must be logged in to perform this action');
  }
  return context.userId;
};

/**
 * Throws if the user is not authenticated or not associated with the specified shelter.
 * Use this for shelter-specific mutations like managing animals, staff, etc.
 */
export const requireShelterStaff = async (
  context: GraphQLContext,
  shelterId: string
): Promise<string> => {
  const userId = requireAuth(context);

  // Admin users can access any shelter
  if (context.userRole === 'admin') {
    return userId;
  }

  // Check if user's shelter matches the requested shelter
  if (context.shelterId === shelterId) {
    return userId;
  }

  // Fallback: Check shelter's users array directly from database
  const shelter = await Shelter.findById(shelterId);
  if (!shelter) {
    throw new AuthorizationError('Shelter not found');
  }

  const isStaff = shelter.users.some(
    (staffId) => staffId.toString() === userId
  );

  if (!isStaff) {
    throw new AuthorizationError(
      'You do not have permission to perform this action for this shelter'
    );
  }

  return userId;
};

/**
 * Throws if the user is not authenticated or not an admin.
 * Use this for admin-only operations like verifying shelters.
 */
export const requireAdmin = (context: GraphQLContext): string => {
  const userId = requireAuth(context);

  if (context.userRole !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  return userId;
};

/**
 * Throws if the authenticated user is not the owner of the resource.
 * Use this for user-specific operations like updating own profile.
 */
export const requireSelf = (context: GraphQLContext, resourceUserId: string): string => {
  const userId = requireAuth(context);

  // Admin can access any user's resources
  if (context.userRole === 'admin') {
    return userId;
  }

  if (userId !== resourceUserId) {
    throw new AuthorizationError('You can only perform this action on your own account');
  }

  return userId;
};

/**
 * Throws if the user is not the owner of the application or shelter staff.
 * Use this for application-related operations.
 */
export const requireApplicationAccess = async (
  context: GraphQLContext,
  applicationUserId: string,
  shelterId?: string
): Promise<string> => {
  const userId = requireAuth(context);

  // Admin can access any application
  if (context.userRole === 'admin') {
    return userId;
  }

  // User can access their own applications
  if (userId === applicationUserId) {
    return userId;
  }

  // Shelter staff can access applications for their shelter's animals
  if (shelterId && context.shelterId === shelterId) {
    return userId;
  }

  throw new AuthorizationError(
    'You do not have permission to access this application'
  );
};
