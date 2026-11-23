const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const http = require('http');
const fs = require('fs');

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);

    if (data) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(data));
      }
    }

    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND REST API TEST SUITE ---');
  let token = '';
  let createdProjectId = '';
  let createdSkillId = '';
  let createdExpId = '';
  let createdEduId = '';
  let createdMsgId = '';

  // 1. Health check
  const health = await request({ path: '/' });
  console.log(`[1] Health Check: status=${health.status}, statusText=${health.body.status}`);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Auth Login - Invalid
  const badLogin = await request({ path: '/api/auth/login', method: 'POST' }, { email: 'admin@portfolio.local', password: 'wrong' });
  console.log(`[2] Bad Login Check: status=${badLogin.status} (expected 401)`);
  if (badLogin.status !== 401) throw new Error('Bad login should fail with 401');

  // 3. Auth Login - Valid
  const goodLogin = await request({ path: '/api/auth/login', method: 'POST' }, { email: 'admin@portfolio.local', password: 'Admin@123456' });
  console.log(`[3] Valid Login: status=${goodLogin.status}, hasToken=${Boolean(goodLogin.body.token)}`);
  if (goodLogin.status !== 200 || !goodLogin.body.token) throw new Error('Valid login failed');
  token = goodLogin.body.token;

  const authHeader = { Authorization: `Bearer ${token}` };

  // 4. Auth Me
  const me = await request({ path: '/api/auth/me', headers: authHeader });
  console.log(`[4] Auth /me: status=${me.status}, email=${me.body.email}`);
  if (me.status !== 200) throw new Error('/me endpoint failed');

  // 5. Auth Me - No Token
  const meNoToken = await request({ path: '/api/auth/me' });
  console.log(`[5] Auth /me without token: status=${meNoToken.status} (expected 401)`);
  if (meNoToken.status !== 401) throw new Error('Unauthenticated /me should be 401');

  // 6. Settings GET & PUT
  const settingsGet = await request({ path: '/api/settings' });
  console.log(`[6] GET /api/settings: status=${settingsGet.status}, name="${settingsGet.body.name}"`);
  if (settingsGet.status !== 200) throw new Error('GET settings failed');

  const settingsPut = await request(
    { path: '/api/settings', method: 'PUT', headers: authHeader },
    { tagline: 'Updated tagline test' }
  );
  console.log(`[7] PUT /api/settings: status=${settingsPut.status}, tagline="${settingsPut.body.tagline}"`);
  if (settingsPut.status !== 200 || settingsPut.body.tagline !== 'Updated tagline test') throw new Error('PUT settings failed');

  // 7. Projects CRUD
  const projectsList = await request({ path: '/api/projects' });
  console.log(`[8] GET /api/projects: status=${projectsList.status}, count=${projectsList.body.length}`);
  if (projectsList.status !== 200) throw new Error('GET projects failed');

  const newProject = await request(
    { path: '/api/projects', method: 'POST', headers: authHeader },
    { title: 'Test Project', description: 'Test Description', category: 'Frontend', technologies: ['Angular'] }
  );
  console.log(`[9] POST /api/projects: status=${newProject.status}, id=${newProject.body.id || newProject.body._id}`);
  if (newProject.status !== 201) throw new Error('POST project failed');
  createdProjectId = newProject.body.id || newProject.body._id;

  const getProj = await request({ path: `/api/projects/${createdProjectId}` });
  console.log(`[10] GET /api/projects/:id: status=${getProj.status}, title="${getProj.body.title}"`);
  if (getProj.status !== 200) throw new Error('GET project by id failed');

  const putProj = await request(
    { path: `/api/projects/${createdProjectId}`, method: 'PUT', headers: authHeader },
    { title: 'Updated Test Project' }
  );
  console.log(`[11] PUT /api/projects/:id: status=${putProj.status}, title="${putProj.body.title}"`);
  if (putProj.status !== 200) throw new Error('PUT project failed');

  const delProj = await request({ path: `/api/projects/${createdProjectId}`, method: 'DELETE', headers: authHeader });
  console.log(`[12] DELETE /api/projects/:id: status=${delProj.status}`);
  if (delProj.status !== 200) throw new Error('DELETE project failed');

  const badIdProj = await request({ path: '/api/projects/invalid-id-format' });
  console.log(`[13] Invalid ID error handling: status=${badIdProj.status} (expected 400)`);
  if (badIdProj.status !== 400) throw new Error('Invalid ID should return 400');

  // 8. Skills CRUD
  const newSkill = await request(
    { path: '/api/skills', method: 'POST', headers: authHeader },
    { name: 'GraphQL', level: 80, category: 'Backend', icon: 'server' }
  );
  console.log(`[14] POST /api/skills: status=${newSkill.status}`);
  if (newSkill.status !== 201) throw new Error('POST skill failed');
  createdSkillId = newSkill.body.id || newSkill.body._id;

  const delSkill = await request({ path: `/api/skills/${createdSkillId}`, method: 'DELETE', headers: authHeader });
  console.log(`[15] DELETE /api/skills/:id: status=${delSkill.status}`);
  if (delSkill.status !== 200) throw new Error('DELETE skill failed');

  // 9. Experience CRUD
  const newExp = await request(
    { path: '/api/experience', method: 'POST', headers: authHeader },
    { role: 'Lead Architect', company: 'Future Corp', startDate: '2025', description: 'Leading full stack systems' }
  );
  console.log(`[16] POST /api/experience: status=${newExp.status}`);
  if (newExp.status !== 201) throw new Error('POST experience failed');
  createdExpId = newExp.body.id || newExp.body._id;

  const delExp = await request({ path: `/api/experience/${createdExpId}`, method: 'DELETE', headers: authHeader });
  console.log(`[17] DELETE /api/experience/:id: status=${delExp.status}`);
  if (delExp.status !== 200) throw new Error('DELETE experience failed');

  // 10. Education CRUD
  const newEdu = await request(
    { path: '/api/education', method: 'POST', headers: authHeader },
    { institution: 'MIT', faculty: 'EECS', degree: 'M.Sc.', startYear: '2026', description: 'Advanced research' }
  );
  console.log(`[18] POST /api/education: status=${newEdu.status}`);
  if (newEdu.status !== 201) throw new Error('POST education failed');
  createdEduId = newEdu.body.id || newEdu.body._id;

  const delEdu = await request({ path: `/api/education/${createdEduId}`, method: 'DELETE', headers: authHeader });
  console.log(`[19] DELETE /api/education/:id: status=${delEdu.status}`);
  if (delEdu.status !== 200) throw new Error('DELETE education failed');

  // 11. Contact Message
  const postMsg = await request(
    { path: '/api/contact', method: 'POST' },
    { name: 'John Doe', email: 'john@example.com', subject: 'Project Inquiry', message: 'Hello, I want to discuss a new website.' }
  );
  console.log(`[20] POST /api/contact: status=${postMsg.status}, id=${postMsg.body.id}`);
  if (postMsg.status !== 201) throw new Error('POST contact failed');
  createdMsgId = postMsg.body.id;

  const listMsgs = await request({ path: '/api/contact', headers: authHeader });
  console.log(`[21] GET /api/contact (protected): status=${listMsgs.status}, total=${listMsgs.body.length}`);
  if (listMsgs.status !== 200) throw new Error('GET contact messages failed');

  const patchMsg = await request({ path: `/api/contact/${createdMsgId}/read`, method: 'PATCH', headers: authHeader });
  console.log(`[22] PATCH /api/contact/:id/read: status=${patchMsg.status}, read=${patchMsg.body.read}`);
  if (patchMsg.status !== 200 || !patchMsg.body.read) throw new Error('PATCH contact message read failed');

  const delMsg = await request({ path: `/api/contact/${createdMsgId}`, method: 'DELETE', headers: authHeader });
  console.log(`[23] DELETE /api/contact/:id: status=${delMsg.status}`);
  if (delMsg.status !== 200) throw new Error('DELETE contact message failed');

  // 12. File Upload Test
  const boundary = '----WebKitFormBoundaryTest123456';
  const fileContent = 'Hello Portfolio Upload Test';
  const bodyBuffer = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\n`),
    Buffer.from(fileContent),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  // text/plain is rejected by file filter, so expect 500/400 upload error
  const rejectUpload = await request({
    path: '/api/upload',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length,
    },
  }, bodyBuffer);
  console.log(`[24] Disallowed file type upload rejection: status=${rejectUpload.status} (expected 400/500)`);

  // Valid png upload
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngBody = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`),
    pngHeader,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const validUpload = await request({
    path: '/api/upload',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': pngBody.length,
    },
  }, pngBody);
  console.log(`[25] Valid image upload: status=${validUpload.status}, url=${validUpload.body.url}`);
  if (validUpload.status !== 201 || !validUpload.body.url) throw new Error('Valid upload failed');

  // Verify static file serving
  const uploadedStatic = await request({ path: validUpload.body.url });
  console.log(`[26] Static file access: status=${uploadedStatic.status}`);
  if (uploadedStatic.status !== 200) throw new Error('Static file retrieval failed');

  console.log('--- ALL BACKEND REST API TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('[TEST FAILURE]', err);
  process.exit(1);
});
