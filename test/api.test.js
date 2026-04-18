process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const db = require('../db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

async function resetDatabase() {
  await run('DELETE FROM posts');
  await run('DELETE FROM users');
}

test.beforeEach(async () => {
  await resetDatabase();
});

test.after(() => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
});

test('テスト環境: インメモリDBを使う', () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(db.filename, ':memory:');
});

test('正常系: register -> login -> create post succeeds', async () => {
  const registerRes = await request(app)
    .post('/register')
    .send({ username: 'alice', password: 'password123' });

  assert.equal(registerRes.status, 201);

  const loginRes = await request(app)
    .post('/login')
    .send({ username: 'alice', password: 'password123' });

  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  const createRes = await request(app)
    .post('/posts')
    .set('Authorization', `Bearer ${loginRes.body.token}`)
    .send({ title: 'first post', content: 'hello' });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.message, '作成しました');

  const listRes = await request(app).get('/posts');
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.length, 1);
  assert.equal(listRes.body[0].title, 'first post');
});

test('認証失敗: tokenなしの投稿作成は401', async () => {
  const res = await request(app)
    .post('/posts')
    .send({ title: 'blocked', content: 'no token' });

  assert.equal(res.status, 401);
});

test('権限違反: 他人の投稿更新は403', async () => {
  await request(app)
    .post('/register')
    .send({ username: 'alice', password: 'password123' });
  await request(app)
    .post('/register')
    .send({ username: 'bob', password: 'password123' });

  const aliceLogin = await request(app)
    .post('/login')
    .send({ username: 'alice', password: 'password123' });
  const bobLogin = await request(app)
    .post('/login')
    .send({ username: 'bob', password: 'password123' });

  const createRes = await request(app)
    .post('/posts')
    .set('Authorization', `Bearer ${aliceLogin.body.token}`)
    .send({ title: 'alice post', content: 'owner only' });

  const postId = createRes.body.postId;

  const updateRes = await request(app)
    .put(`/posts/${postId}`)
    .set('Authorization', `Bearer ${bobLogin.body.token}`)
    .send({ title: 'hacked', content: 'not allowed' });

  assert.equal(updateRes.status, 403);
});

test('重複登録: 同一usernameは409', async () => {
  const first = await request(app)
    .post('/register')
    .send({ username: 'duplicate', password: 'password123' });
  const second = await request(app)
    .post('/register')
    .send({ username: 'duplicate', password: 'password123' });

  assert.equal(first.status, 201);
  assert.equal(second.status, 409);
});
