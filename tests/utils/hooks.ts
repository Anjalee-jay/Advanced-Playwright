import { Page } from '@playwright/test';
import { buildUrl } from './uiUrlBuilder';

type PageObjectConstructor<T> = new (page: Page) => T;

async function beforeEach<T>(
  page: Page,
  PageObjectParam: PageObjectConstructor<T>,
  targetPage: string,
  params?: Record<any, any>
): Promise<T> {
  await page.goto(buildUrl(targetPage, params), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const pageObject = new PageObjectParam(page);
  return pageObject;
}

export default { beforeEach };
