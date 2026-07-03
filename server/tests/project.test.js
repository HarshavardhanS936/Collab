import request from 'supertest';
import { app } from '../src/app.js';

describe('Project Endpoints', () => {
  let tokenOwner, tokenOther;

  const projectData = {
    title: 'Super Secret Project',
    description: 'This is a valid description.',
    domain: 'Software Engineering',
    requiredSkills: ['React', 'Node.js'],
    deadline: '2 months', // Instead of Date
    teamSize: 4
  };

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Owner', email: 'owner@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    tokenOwner = res1.body.data.token;

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Other', email: 'other@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    tokenOther = res2.body.data.token;
  });

  it('Creating a project while authenticated returns 201', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send(projectData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.title).toBe(projectData.title);
  });

  it('Creating a project without auth returns 401', async () => {
    const res = await request(app).post('/api/projects').send(projectData);
    expect(res.status).toBe(401);
  });

  it('A non-owner attempting to update a project returns 403', async () => {
    // Owner creates the project
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send(projectData);
    const projectId = createRes.body.data.project._id;

    // 'Other' user tries to update it
    const updateRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenOther}`)
      .send({ title: 'Hacked Title' });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body.success).toBe(false);
  });

  it('GET /api/projects returns a paginated list', async () => {
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send(projectData);

    const res = await request(app).get('/api/projects?page=1&limit=5');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.projects)).toBe(true);
    expect(res.body.data.projects.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
  });
});
