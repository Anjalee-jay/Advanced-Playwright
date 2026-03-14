import { test } from '../fixtures/books-fixture';
import { APIRequestContext } from '@playwright/test';
import baseAPIUrl, { getRuntimeEnvironment } from '../../utils/environmentBaseUrl';
import createBookAPIRequest from '../../api/requests/create-books-collection';
import deleteBookAPIRequest from '../../api/requests/delete-books-collection';
import userData from '../../data/user-data';

const env = getRuntimeEnvironment();
const password = process.env.PASSWORD!;
const userId = process.env.USERID!;
const userName = process.env.USERNAME!;

let apiContext: APIRequestContext;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
      baseURL: baseAPIUrl[env].api,
      extraHTTPHeaders: {
          Authorization: `Basic ${Buffer.from(`${userName}:${password}`).toString('base64')}`,
          Accept: 'application/json',
      },
  });
});

test.describe('Book - Fixture & API with isolated auth', () => {
  test.use({ isDupe: true });

  test('Add duplicate book', async ({ bookPage }) => {
      await addBooks(userId, userData.books.duplicate);
      await bookPage.goto(userData.books.duplicate);
  });
});

async function addBooks(userId: string, isbn: string) {
  await deleteBookAPIRequest.deleteAllBooksByUser(apiContext, userId);
  await createBookAPIRequest.addBookToCollection(apiContext, userId, isbn);
};
