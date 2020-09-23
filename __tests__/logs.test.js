const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Log = require('../lib/models/log');
const Recipe = require('../lib/models/recipe');

describe('log routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a log', async() => {
    const recipe = await Recipe.insert({
      name: 'bad cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    return request(app)
      .post('/api/v1/logs')
      .send({
        recipeId: '1',
        dateOfEvent: '5/20/20',
        notes: 'super delicious',
        rating: '10'
      })
      .then(res => {
        expect(res.body).toEqual({
          recipeId: '1',
          id: expect.any(String),
          dateOfEvent: '5/20/20',
          notes: 'super delicious',
          rating: '10'
        });
      });
  });

  it('gets all logs', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    const logs = await Promise.all([
      {
        recipeId: '1',
        dateOfEvent: '5/20/20',
        notes: 'my dog ate it',
        rating: '1'
      },
      {
        recipeId: '2',
        dateOfEvent: '5/21/20',
        notes: 'my pony ate it',
        rating: '2'
      },
      {
        recipeId: '3',
        dateOfEvent: '5/22/20',
        notes: 'I ate it while drunk',
        rating: '3'
      }
    ].map(log => Log.insert(log)));

    return request(app)
      .get('/api/v1/logs/')
      .then(res => {
        logs.forEach(log => {
          expect(res.body).toContainEqual(log);
        });
      });
  });

  it('gets one log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'bad cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const log = await Log.insert({
      recipeId: '1',
      dateOfEvent: '5/20/20',
      notes: 'super disgusting',
      rating: '0'
    });

    return request(app)
      .get(`/api/v1/logs/${log.id}`)
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: '1',
          dateOfEvent: '5/20/20',
          notes: 'super disgusting',
          rating: '0'
        });
      });
  });

  it('updates a log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'bad cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const log = await Log.insert({
      recipeId: '1',
      dateOfEvent: '5/20/20',
      notes: 'super disgusting',
      rating: '0'
    });

    return request(app)
      .put(`/api/v1/logs/${log.id}`)
      .send({
        recipeId: '1',
        dateOfEvent: '5/22/20',
        notes: 'super amazing',
        rating: '10'
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: '1',
          dateOfEvent: '5/22/20',
          notes: 'super amazing',
          rating: '10'
        });
      });
  });

  it('deletes a log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'bad cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const log = await Log.insert({
      recipeId: '1',
      dateOfEvent: '5/22/20',
      notes: 'super disgusting',
      rating: '0'
    });

    const response = await request(app)
      .delete(`/api/v1/logs/${log.id}`);

    expect(response.body).toEqual({
      id: log.id,
      recipeId: '1',
      dateOfEvent: '5/22/20',
      notes: 'super disgusting',
      rating: '0'
    });
  });
});
