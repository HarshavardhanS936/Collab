import request from 'supertest';
import { app } from '../src/app.js';

describe('Join Request Endpoints', () => {
  let tokenOwner, ownerId;
  let tokenRequester, requesterId;
  let projectId;
  
  const projectData = {
    title: 'Cool Game Engine', 
    description: 'A 2D game engine', 
    domain: 'Game Dev', 
    requiredSkills: ['C++'],
    deadline: '2 months', 
    teamSize: 2
  };

  beforeEach(async () => {
    // 1. Create owner
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Owner', email: 'owner@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    tokenOwner = res1.body.data.token;
    ownerId = res1.body.data.user.id;

    // 2. Create requester
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Requester', email: 'req@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    tokenRequester = res2.body.data.token;
    requesterId = res2.body.data.user.id;

    // 3. Create project
    const createProj = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send(projectData);
    projectId = createProj.body.data.project._id;
  });

  it('Sending a join request to your own project returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/owner of this project/i);
  });

  it('Sending a duplicate join request returns 400', async () => {
    // Initial successful request
    await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenRequester}`);
    
    // Duplicate forbidden request
    const res = await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenRequester}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already sent/i);
  });

  it('Accepting a join request adds the user to the project\'s members', async () => {
    // Send request
    const reqRes = await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenRequester}`);
    const requestId = reqRes.body.data.joinRequest._id;

    // Accept request as owner
    const acceptRes = await request(app)
      .put(`/api/join-requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.project.members).toContain(requesterId);
  });

  it('Accepting a request when the team is full returns 400', async () => {
    // Max teamSize is 2. The owner is 1. We have exactly 1 spot left.
    // Let's accept requester to fill the team!
    const reqRes = await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenRequester}`);
      
    await request(app)
      .put(`/api/join-requests/${reqRes.body.data.joinRequest._id}/accept`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    // Now let's try to squeeze a third user into the full team
    const res3 = await request(app).post('/api/auth/register').send({
      name: 'Latecomer', email: 'late@test.com', password: 'pass', department: 'CS', college: 'Test'
    });
    const tokenLatecomer = res3.body.data.token;

    // The request to join goes through fine, because status is just "pending"
    const req3Res = await request(app)
      .post(`/api/projects/${projectId}/join-requests`)
      .set('Authorization', `Bearer ${tokenLatecomer}`);
    
    // The OWNER attempting to accept them should trigger the 400
    const acceptRes = await request(app)
      .put(`/api/join-requests/${req3Res.body.data.joinRequest._id}/accept`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(acceptRes.status).toBe(400);
    expect(acceptRes.body.message).toMatch(/full/i);
  });
});
