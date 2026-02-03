import DataLoader from 'dataloader';
import mongoose, { Types } from 'mongoose';
import { AnimalDocument } from '../models/Animal';
import { ApplicationDocument } from '../models/Application';
import { ShelterDocument } from '../models/Shelter';
import { UserDocument } from '../models/User';

const Animal = mongoose.model<AnimalDocument>('animal');
const Application = mongoose.model<ApplicationDocument>('application');
const Shelter = mongoose.model<ShelterDocument>('shelter');
const User = mongoose.model<UserDocument>('user');

type IdValue = string | Types.ObjectId;

const normalizeId = (value: IdValue): string => value.toString();

const createByIdLoader = <T extends { _id: IdValue }>(
  fetcher: (ids: string[]) => Promise<T[]>
): DataLoader<string, T | null> =>
  new DataLoader<string, T | null>(async (ids: readonly string[]) => {
    const results = await fetcher(ids.map((id) => id.toString()));
    const map = new Map(results.map((item) => [normalizeId(item._id), item]));
    return ids.map((id) => map.get(id) ?? null);
  });

export const filterLoaderResults = <T>(results: readonly (T | Error)[]): T[] =>
  results.filter((result): result is T => !(result instanceof Error));

export interface Loaders {
  animalById: DataLoader<string, AnimalDocument | null>;
  applicationById: DataLoader<string, ApplicationDocument | null>;
  shelterById: DataLoader<string, ShelterDocument | null>;
  userById: DataLoader<string, UserDocument | null>;
}

export const createLoaders = (): Loaders => ({
  animalById: createByIdLoader<AnimalDocument>((ids) => Animal.find({ _id: { $in: ids } })),
  applicationById: createByIdLoader<ApplicationDocument>((ids) => Application.find({ _id: { $in: ids } })),
  shelterById: createByIdLoader<ShelterDocument>((ids) => Shelter.find({ _id: { $in: ids } })),
  userById: createByIdLoader<UserDocument>((ids) => User.find({ _id: { $in: ids } })),
});
