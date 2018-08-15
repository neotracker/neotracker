<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';
require __DIR__.'/NEOTrackerGitHubUtils.php';
require __DIR__.'/NEOTrackerUtils.php';
require __DIR__.'/SetupGitPhase.php';

use \Facebook\ShipIt\ {
  ShipItBaseConfig,
  ShipItChangeset,
  ShipItCreateNewRepoPhase,
  ShipItGitHubInitPhase,
  ShipItPathFilters,
  ShipItPhaseRunner,
  ShipItPullPhase,
  ShipItPushPhase,
  ShipItRepoSide,
  ShipItSyncPhase,
  ShipItTransport,
};

class ShipNEOTracker {

  public static function filterChangeset(
    ShipItChangeset $changeset,
  ): ShipItChangeset {
    return $changeset
      |> ShipItPathFilters::stripPaths(
          $$,
          ImmVector {
            '@^(?!decls/|hack/|packages/|public/|root/|babel.config.js|.editorconfig|.eslintignore|.eslintrc.json|.flowconfig|.gitignore|.prettierignore|.prettierrc|lerna.json|LICENSE|package.oss.json|README.md|yarn.oss.lock|.circleci.oss/|.github/|.vscode/|\@types/|tsconfig.json|tsconfig.cli.json|tslint.json|e2e.json|jest.e2e.js|jest.unit.js|mocha.json|cypress.json|cypress/|tsconfig.compile.json|.storybook|jest.browser.unit.js|wallaby.unit.js|wallaby.js|wallaby.base.js|tsconfig/|tsconfig.jest.json|jest/|explorer.config.js|.stylelintrc|.size-limit.js|.graphqlconfig|jest.config.oss.js)@',
            '@^(packages/neotracker-internal|cypress/integration/internal)@',
          },
        )
      |> ShipItPathFilters::moveDirectories(
          $$,
          NEOTrackerUtils::getPathMappings(),
        );
  }

  public static function cliMain(): void {
    $config = (new ShipItBaseConfig(
      /* default working dir = */ '/var/tmp/shipit',
      'neotracker-internal',
      'neotracker',
      ImmSet { },
    ))->withSourcePath('./');

    $phases = ImmVector {
      new ShipItGitHubInitPhase(
        'neotracker',
        'neotracker',
        ShipItRepoSide::DESTINATION,
        ShipItTransport::SSH,
        NEOTrackerGitHubUtils::class,
      ),
      new SetupGitPhase(ShipItRepoSide::DESTINATION),
      new ShipItPullPhase(ShipItRepoSide::DESTINATION),
      new ShipItSyncPhase(
        ($config, $changeset) ==> self::filterChangeset($changeset),
      ),
      new ShipItPushPhase(),
    };

    (new ShipItPhaseRunner($config, $phases))->run();
  }
}

ShipNEOTracker::cliMain();
