const mongoose = require('mongoose');
const app = require('../app');
const request = require('supertest');
const User = require('../models/user');

const uri = 'mongodb+srv://samehmostafa625:PX40KeAYz4cOzlum@imdb.lyakcv9.mongodb.net/?retryWrites=true&w=majority&appName=imdb';

// Store test user emails to clean up only those
const testUserEmails = [];

beforeEach(async () => {
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (testUserEmails.length > 0) {
    await User.deleteMany({ email: { $in: testUserEmails } });
  }
  await mongoose.connection.close();
});

describe('User Routes', () => {
  it('should create a user via signup', async () => {
    const email = 'testuser@example.com';
    testUserEmails.push(email);

    const res = await request(app).post('/signup').send({
      firstName: 'Test',
      lastName: 'User',
      email,
      mobile: '1234567890',
      gender: 'male',
      password: 'password123',
      confirmPassword: 'password123'
    });
    
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  it('should not allow duplicate email registration', async () => {
    const email = 'duplicate@example.com';
    await User.create({
      firstName: 'First',
      lastName: 'User',
      email,
      mobile: '1234567890',
      gender: 'male',
      password: 'password123'
    });
    testUserEmails.push(email); // still track it for cleanup

    const res = await request(app).post('/signup').send({
      firstName: 'Second',
      lastName: 'User',
      email,
      mobile: '9876543210',
      gender: 'female',
      password: 'password123',
      confirmPassword: 'password123'
    });
    
    expect(res.status).toBe(400);
  });

  it('should not allow registration with mismatched passwords', async () => {
    const email = 'mismatch@example.com';
    testUserEmails.push(email);

    const res = await request(app).post('/signup').send({
      firstName: 'Mismatch',
      lastName: 'Password',
      email,
      mobile: '1234567890',
      gender: 'male',
      password: 'password123',
      confirmPassword: 'differentpassword'
    });
    
    expect(res.status).toBe(400);
  });

  it('should login a user with valid credentials', async () => {
    const email = 'login@example.com';
    testUserEmails.push(email);

    await User.create({
      firstName: 'Login',
      lastName: 'Test',
      email,
      mobile: '1234567890',
      gender: 'male',
      password: 'password123'
    });

    const res = await request(app).post('/login').send({
      email,
      password: 'password123'
    });
    
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/welcome');
  });

  it('should reject login with invalid email', async () => {
    const res = await request(app).post('/login').send({
      email: 'nonexistent@example.com',
      password: 'password123'
    });
    
    expect(res.status).toBe(400);
  });

  it('should reject login with invalid password', async () => {
    const email = 'wrongpass@example.com';
    testUserEmails.push(email);

    await User.create({
      firstName: 'Wrong',
      lastName: 'Password',
      email,
      mobile: '1234567890',
      gender: 'male',
      password: 'password123'
    });

    const res = await request(app).post('/login').send({
      email,
      password: 'wrongpassword'
    });
    
    expect(res.status).toBe(400);
  });

  it('should log out a user', async () => {
    const res = await request(app).get('/logout');
    
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });
});
