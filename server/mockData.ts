// Mock data for when MongoDB is not connected
// This allows the app to display sample data for demo purposes

export const mockAnimals = [
  {
    _id: 'mock-1',
    name: 'Buddy',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    sex: 'Male',
    color: 'Golden',
    description: 'Buddy is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks. He\'s great with kids and other dogs.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-2',
    name: 'Whiskers',
    type: 'Cat',
    breed: 'Tabby',
    age: 2,
    sex: 'Female',
    color: 'Orange',
    description: 'Whiskers is a sweet and curious tabby cat. She loves to curl up in sunny spots and enjoys gentle pets.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-3',
    name: 'Max',
    type: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    sex: 'Male',
    color: 'Black and Tan',
    description: 'Max is a loyal and intelligent German Shepherd. He\'s well-trained and would make an excellent companion for an active family.',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-4',
    name: 'Luna',
    type: 'Cat',
    breed: 'Siamese',
    age: 1,
    sex: 'Female',
    color: 'Cream and Brown',
    description: 'Luna is a playful Siamese kitten with beautiful blue eyes. She\'s very vocal and loves attention.',
    image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-5',
    name: 'Rocky',
    type: 'Dog',
    breed: 'Labrador Retriever',
    age: 5,
    sex: 'Male',
    color: 'Chocolate',
    description: 'Rocky is a gentle chocolate lab who loves swimming and playing with toys. He\'s house-trained and great with children.',
    image: 'https://images.unsplash.com/photo-1579213838058-8ad64ccdc54e?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-6',
    name: 'Mittens',
    type: 'Cat',
    breed: 'Persian',
    age: 3,
    sex: 'Female',
    color: 'White',
    description: 'Mittens is a fluffy Persian cat with a calm demeanor. She enjoys lounging and being brushed.',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-7',
    name: 'Charlie',
    type: 'Dog',
    breed: 'Beagle',
    age: 2,
    sex: 'Male',
    color: 'Tricolor',
    description: 'Charlie is an adventurous beagle with an excellent nose. He loves exploring and would be perfect for someone who enjoys outdoor activities.',
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400',
    images: [],
    video: '',
    status: 'available'
  },
  {
    _id: 'mock-8',
    name: 'Shadow',
    type: 'Cat',
    breed: 'Domestic Shorthair',
    age: 4,
    sex: 'Male',
    color: 'Black',
    description: 'Shadow is a sleek black cat with bright green eyes. He\'s independent but affectionate once he warms up to you.',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    images: [],
    video: '',
    status: 'available'
  }
];

export const mockPlatformStats = {
  totalUsers: 150,
  totalShelters: 12,
  totalAnimals: 245,
  totalApplications: 89,
  availableAnimals: 178,
  adoptedAnimals: 67,
  totalDonations: 15420
};

export const mockSuccessStories = [
  {
    _id: 'story-1',
    userId: 'user-1',
    animalName: 'Bella',
    animalType: 'Dog',
    title: 'Finding Our Perfect Companion',
    story: 'We adopted Bella six months ago and she has brought so much joy to our family. She loves playing in the backyard and has become best friends with our kids.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'story-2',
    userId: 'user-2',
    animalName: 'Oliver',
    animalType: 'Cat',
    title: 'A Purrfect Match',
    story: 'Oliver was shy at first but now he rules the house! He greets me every morning and loves to cuddle on the couch during movie nights.',
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
    createdAt: new Date().toISOString()
  }
];

// Helper function to check if MongoDB is connected
export function isMongoConnected(): boolean {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// Filter mock animals based on query args
export function filterMockAnimals(args: {
  type?: string;
  breed?: string;
  sex?: string;
  color?: string;
  name?: string;
  status?: string;
  minAge?: number;
  maxAge?: number;
  limit?: number;
  offset?: number;
}) {
  let filtered = [...mockAnimals];

  if (args.type) {
    filtered = filtered.filter(a => a.type.toLowerCase() === args.type!.toLowerCase());
  }
  if (args.breed) {
    filtered = filtered.filter(a => a.breed.toLowerCase().includes(args.breed!.toLowerCase()));
  }
  if (args.sex) {
    filtered = filtered.filter(a => a.sex.toLowerCase() === args.sex!.toLowerCase());
  }
  if (args.color) {
    filtered = filtered.filter(a => a.color.toLowerCase().includes(args.color!.toLowerCase()));
  }
  if (args.name) {
    filtered = filtered.filter(a => a.name.toLowerCase().includes(args.name!.toLowerCase()));
  }
  if (args.status) {
    filtered = filtered.filter(a => a.status === args.status);
  }
  if (args.minAge !== undefined) {
    filtered = filtered.filter(a => a.age >= args.minAge!);
  }
  if (args.maxAge !== undefined) {
    filtered = filtered.filter(a => a.age <= args.maxAge!);
  }

  // Apply pagination
  const offset = args.offset || 0;
  const limit = args.limit || filtered.length;

  return filtered.slice(offset, offset + limit);
}
