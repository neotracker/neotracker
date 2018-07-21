const faker = require('faker');

faker.seed(123);
/* eslint-disable */
jest.setTimeout(5 * 60 * 1000);

afterEach(async () => {
  await neotracker.cleanupTest();
});
