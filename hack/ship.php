<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';
require __DIR__.'/NEOTrackerGitHubUtils.php';
require __DIR__.'/NEOTrackerUtils.php';
require __DIR__.'/ShipItYarnPhase.php';

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
  ShipItYarnPhase,
};

class ShipNEOTracker {

  public static function filterChangeset(
    ShipItChangeset $changeset,
  ): ShipItChangeset {
    return $changeset
      |> ShipItPathFilters::stripPaths(
          $$,
          ImmVector {
            '@^(?!decls/|hack/|packages/|public/|root/|.babelrc|.editorconfig|.eslintignore|.eslintrc.json|.flowconfig|.gitignore|.prettierignore|.prettierrc|lerna.json|LICENSE|package.oss.json|README.md|yarn.oss.lock)@',
            '@^packages/neotracker-internal@',
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
      new ShipItCreateNewRepoPhase(
        ($changeset) ==> self::filterChangeset($changeset),
        shape(
          'name' => 'dicarlo2',
          'email' => 'alexdicarlo@gmail.com'
        ),
      ),
      new ShipItPullPhase(ShipItRepoSide::DESTINATION),
      new ShipItSyncPhase(
        ($config, $changeset) ==> self::filterChangeset($changeset),
      ),
      new ShipItYarnPhase(ShipItRepoSide::DESTINATION),
      new ShipItPushPhase(),
    };

    (new ShipItPhaseRunner($config, $phases))->run();
  }
}

ShipNEOTracker::cliMain();
