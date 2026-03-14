import { type Page, type Locator , expect, type BrowserContext } from '@playwright/test';
import bookListData from '../../data/book-list-data';
import apiPaths from '../../utils/apiPaths';

class SearchPage {
  readonly page: Page;
  readonly bookAdminLabel: Locator;
  readonly booksCollectionRequestRegExp: RegExp;
  readonly bookUserLabel: Locator;
  readonly booksInGrid: Locator;
  readonly notLoggedInLabel: Locator;
  readonly searchField: Locator;
  readonly titleHeaderLabel: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.bookAdminLabel = page.getByText('Eloquent JavaScript, Second Edition');
    this.booksCollectionRequestRegExp = new RegExp(apiPaths.account);
    this.booksInGrid = page.locator('tbody tr td:nth-child(2) a');
    this.bookUserLabel = page.getByText('Understanding ECMAScript 6');
    this.notLoggedInLabel = page.getByText('Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself.');
    this.searchField = page.getByPlaceholder('Type to search');
    this.titleHeaderLabel = page.getByText('Title');
  }

  async fillSearchField(q: string) {
    await this.searchField.fill(q);
  }

  async checkSearchResult(q: string, items: string) {
  }

  async checkBooksList() {
    for (const book of bookListData.books){
      await expect(this.page.getByRole('link', { name: book.title })).toBeVisible();
    }
  }

  async sortBooksList() {
    await this.titleHeaderLabel.click({ clickCount: 2 });
  }

  async checkLoggedIn() {
    await expect(this.notLoggedInLabel).not.toBeVisible();
    // await expect(this.notLoggedInLabel).toBeVisible();
  }

  async checkLoggedInUser() {
    await expect(this.notLoggedInLabel).not.toBeVisible();
    await expect(this.bookUserLabel).toBeVisible();
  }

  async checkLoggedInAdmin() {
    await expect(this.notLoggedInLabel).not.toBeVisible();
    await expect(this.bookAdminLabel).toBeVisible();
  }

  async checkSort() {
    await expect(this.booksInGrid).toHaveCount(2, { timeout: 15000 });
    await expect(this.booksInGrid.first()).toContainText(bookListData.books[1].title, { timeout: 15000 });
    await expect(this.booksInGrid.nth(1)).toContainText(bookListData.books[0].title, { timeout: 15000 });
  }

  async getBooksList() {
  }

  async mockBooksListResponse(context: BrowserContext) {
    await context.route(this.booksCollectionRequestRegExp, (route) => route.fulfill({
      body: JSON.stringify({...(bookListData)})
    }));
  }
}

export default SearchPage;
