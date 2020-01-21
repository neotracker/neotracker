const parseNEOTrackerSession = (response: Cypress.Response): number => {
  const neotrackerRows = response.body.split('\n').filter((row: string) => row.indexOf('neotracker_session') !== -1);

  return neotrackerRows.length < 3 ? 0 : Number(neotrackerRows[2].split(' ').pop());
};

describe('Report', () => {
  it('loads and forwards metrics', () => {
    const metricsEndpoint = 'http://localhost:1327/metrics';

    cy.request(metricsEndpoint).then((response) => {
      const initialSessionCount = parseNEOTrackerSession(response);

      cy.visit('/');
      cy.wait(11000);

      cy.request(metricsEndpoint).then((afterResponse) => {
        const afterSessionCount = parseNEOTrackerSession(afterResponse);
        expect(afterSessionCount).to.equal(initialSessionCount + 1);
      });
    });
  });
});
