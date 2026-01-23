import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import User from './models/User';
import Shelter from './models/Shelter';
import Animal from './models/Animal';

const router = express.Router();

const randomFirstName = (): string => faker.person.firstName();
const randomEmail = (): string => faker.internet.email();
const randomZipCode = (): string => faker.location.zipCode();
const randomParagraph = (): string => faker.lorem.paragraph();
const randomAnimalPic = (): string => faker.image.urlLoremFlickr({ category: 'animals' });
const randomCatPic = (): string => faker.image.urlLoremFlickr({ category: 'cats' });
const randomAnimalColor = (): string => faker.color.human();
const randomAnimalAge = (): number => faker.number.int({ min: 1, max: 15 });

interface AnimalSeedData {
  name: string;
  type: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  video: string;
  applications: string[];
}

const createAnimal = async (animal: AnimalSeedData): Promise<string> => {
  const newAnimal = new Animal(animal);
  await newAnimal.save();
  return newAnimal._id.toString();
};

const createShelterWithAdmin = async (animalIds: string[]): Promise<void> => {
  const password = 'Hunter2';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = new User({
    name: randomFirstName(),
    email: randomEmail(),
    userRole: 'shelter',
    paymentEmail: '',
    password: hashedPassword,
  });

  await admin.save();

  const shelter = new Shelter({
    name: randomFirstName() + ' Animal Rescue',
    location: randomZipCode(),
    users: [admin._id],
    paymentEmail: randomEmail(),
    animals: animalIds,
  });

  await shelter.save();
};

router.get('/newAnimal', async (_req: Request, res: Response) => {
  try {
    const animals: AnimalSeedData[] = [];

    for (let i = 0; i < 100; i++) {
      animals.push({
        name: randomFirstName(),
        type: i % 2 === 0 ? 'Dog' : 'Cat',
        age: randomAnimalAge(),
        sex: i % 2 === 0 ? 'Female' : 'Male',
        color: randomAnimalColor(),
        description: randomParagraph(),
        image: i % 2 === 0 ? randomAnimalPic() : randomCatPic(),
        video: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
        applications: [],
      });
    }

    const animalIds = await Promise.all(animals.map(createAnimal));
    await createShelterWithAdmin(animalIds);

    res.json({ message: 'Seeded 100 animals with shelter successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed', details: String(error) });
  }
});

export default router;
