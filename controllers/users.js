const express = require('express');
const { JsonDB } = require('node-json-db');

const db = new JsonDB('./users.json', true);

const router = express.Router();

router.get('/', (req, res) => {
  const data = db.getData('/');
  res.send(data).status(200);
});

router.get('/:username', (req, res) => {
  const full = db.getData('/');
  const user = full.filter(item => item.username === req.params.username)[0];

  if (user === undefined)
    return res.status(404).send({ error: 'USER_NOT_FOUND' });

  return res.send(user);
});

router.post('/', (req, res) => {
  const arr = db.getData('/');
  const userAlreadyExists =
    arr.filter(user => user.username === req.body.username)[0] !== undefined;

  if (userAlreadyExists)
    return res.status(500).json({ error: 'USER_ALREADY_EXISTS' });

  arr.push(req.body);
  db.push('/', arr);
  return res.status(201).send(req.body);
});

router.delete('/:username', (req, res) => {
  // db.delete(`/${req.params.username}`);
  const arr = db
    .getData('/')
    .filter(user => user.username !== req.params.username);
  db.push('/', arr);
  res.status(200).end();
});

router.patch('/:username', (req, res) => {
  // TODO: add checking if username exists
  // also auth lol?
  const arr = db.getData('/').map(user => {
    if (user.username === req.params.username) return { ...user, ...req.body };
    return user;
  });
  db.push('/', arr);
  res.send(req.body);
});

router.put('/:username', (req, res) => {
  // TODO: add checking if username exists
  // also auth lol?
  const arr = db.getData('/').map(user => {
    if (user.username === req.params.username)
      return { ...req.body, username: req.params.username };
    return user;
  });
  db.push('/', arr);
  res.send(req.body);
});

module.exports = router;
