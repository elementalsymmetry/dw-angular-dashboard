import { DwAngularDashboardPage } from './app.po';

describe('dw-angular-dashboard App', () => {
  let page: DwAngularDashboardPage;

  beforeEach(() => {
    page = new DwAngularDashboardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
