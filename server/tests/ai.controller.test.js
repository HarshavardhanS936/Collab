import request from 'supertest';
import { app } from '../src/app.js';
import { ApiError } from '../src/utils/apiError.js';
import { jest } from '@jest/globals';

// Fully mock the OpenRouter service
jest.mock('../src/services/openrouter.service.js', () => ({
  callOpenRouter: jest.fn()
}));

import { callOpenRouter } from '../src/services/openrouter.service.js';

describe('AI Endpoints', () => {
  let token;

  beforeEach(async () => {
    jest.clearAllMocks(); // Ensure no test pollution

    const res = await request(app).post('/api/auth/register').send({
      name: 'AI Tester', email: 'ai@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    token = res.body.data.token;
  });

  it('generateDescription returns a description on a mocked successful OpenRouter reply', async () => {
    callOpenRouter.mockResolvedValue('This is an awesome software engineering project.');

    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'A great new app idea that does everything.' }); 

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('This is an awesome software engineering project.');
    expect(callOpenRouter).toHaveBeenCalledTimes(1);
  });

  it('suggestSkills correctly parses a comma-separated mocked reply into an array', async () => {
    callOpenRouter.mockResolvedValue('React, Node.js, MongoDB, Express');

    const res = await request(app)
      .post('/api/ai/suggest-skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'A great new app idea.' });

    expect(res.status).toBe(200);
    expect(res.body.data.skills).toEqual(['React', 'Node.js', 'MongoDB', 'Express']);
  });

  it('generateTasks correctly parses a numbered-list mocked reply into an array', async () => {
    callOpenRouter.mockResolvedValue(`1. Setup DB\n2. Build API\n3. Deploy`);

    const res = await request(app)
      .post('/api/ai/generate-tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ projectTitle: 'Test Project' });

    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toEqual(['Setup DB', 'Build API', 'Deploy']);
  });

  it('A mocked OpenRouter failure results in a 502 response, not a crash', async () => {
    // Service normally throws an ApiError(502) inside the catch block if the network request fails
    callOpenRouter.mockRejectedValue(new ApiError(502, 'AI service unavailable, please try again'));

    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${token}`)
      .send({ idea: 'A great new app idea that will inevitably fail because the API is down.' });

    expect(res.status).toBe(502);
    expect(res.body.message).toMatch(/unavailable/i);
  });
});
