import { describe, it, expect } from 'vitest';
import { parseCsv } from '../util/parseCsv';

describe('parseCsv', () => {
  it('should parse valid CSV with all columns', () => {
    const csv = `name,type,breed,age,sex,color,description,image,video
Buddy,Dog,Labrador,3,Male,Golden,Friendly dog,http://img.com/1.jpg,http://vid.com/1.mp4`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.animals).toHaveLength(1);
    expect(result.animals[0]).toEqual({
      name: 'Buddy',
      type: 'Dog',
      breed: 'Labrador',
      age: 3,
      sex: 'Male',
      color: 'Golden',
      description: 'Friendly dog',
      image: 'http://img.com/1.jpg',
      video: 'http://vid.com/1.mp4'
    });
  });

  it('should parse CSV with only required columns', () => {
    const csv = `name,type,age,sex,color,description
Luna,Cat,2,Female,Black,Sweet cat`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.animals).toHaveLength(1);
    expect(result.animals[0].name).toBe('Luna');
    expect(result.animals[0].breed).toBe('');
    expect(result.animals[0].image).toBe('');
  });

  it('should error on empty CSV', () => {
    const result = parseCsv('');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('header row');
  });

  it('should error on header only CSV', () => {
    const csv = 'name,type,age,sex,color,description';
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('header row');
  });

  it('should error on missing required columns', () => {
    const csv = `name,type
Buddy,Dog`;
    const result = parseCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Missing required columns');
  });

  it('should error on row with missing name', () => {
    const csv = `name,type,age,sex,color,description
,Dog,3,Male,Golden,A dog`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('name is required');
  });

  it('should error on row with invalid age', () => {
    const csv = `name,type,age,sex,color,description
Buddy,Dog,abc,Male,Golden,A dog`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('age must be a number');
  });

  it('should parse multiple rows', () => {
    const csv = `name,type,age,sex,color,description
Buddy,Dog,3,Male,Golden,Friendly
Luna,Cat,2,Female,Black,Sweet
Max,Dog,5,Male,Brown,Energetic`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.animals).toHaveLength(3);
  });

  it('should handle quoted fields with commas', () => {
    const csv = `name,type,age,sex,color,description
Buddy,Dog,3,Male,Golden,"A friendly, playful dog"`;
    const result = parseCsv(csv);
    expect(result.animals[0].description).toBe('A friendly, playful dog');
  });

  it('should handle quoted fields with escaped quotes', () => {
    const csv = `name,type,age,sex,color,description
Buddy,Dog,3,Male,Golden,"He says ""woof"""`;
    const result = parseCsv(csv);
    expect(result.animals[0].description).toBe('He says "woof"');
  });

  it('should handle case-insensitive headers', () => {
    const csv = `Name,Type,Age,Sex,Color,Description
Buddy,Dog,3,Male,Golden,Friendly`;
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.animals[0].name).toBe('Buddy');
  });

  it('should report multiple row errors', () => {
    const csv = `name,type,age,sex,color,description
,Dog,3,Male,Golden,A dog
Buddy,,abc,,Golden,`;
    const result = parseCsv(csv);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain('Row 2');
    expect(result.errors[1]).toContain('Row 3');
  });

  it('should handle Windows line endings', () => {
    const csv = "name,type,age,sex,color,description\r\nBuddy,Dog,3,Male,Golden,Friendly\r\n";
    const result = parseCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.animals).toHaveLength(1);
  });

  it('should skip empty lines', () => {
    const csv = `name,type,age,sex,color,description

Buddy,Dog,3,Male,Golden,Friendly

`;
    const result = parseCsv(csv);
    expect(result.animals).toHaveLength(1);
  });

  it('should default breed to empty string when not provided', () => {
    const csv = `name,type,age,sex,color,description
Buddy,Dog,3,Male,Golden,Friendly`;
    const result = parseCsv(csv);
    expect(result.animals[0].breed).toBe('');
  });
});
