/* eslint-disable */
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const faker = require('faker');

faker.seed(123);
Enzyme.configure({ adapter: new Adapter() });

afterEach(async () => {
  await neotracker.cleanupTest();
});
