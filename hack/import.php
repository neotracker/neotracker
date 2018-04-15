<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';
require __DIR__.'/NEOTrackerGitHubUtils.php';
require __DIR__.'/NEOTrackerUtils.php';
require __DIR__.'/ShipItYarnPhase.php';

use \Facebook\ShipIt\ {
  ShipItBaseConfig,
  ShipItChangeset,
  ShipItCleanPhase,
  ShipItGitHubInitPhase,
  ShipItPullPhase,
  ShipItRepoSide,
  ShipItTransport,
  ShipItPhaseRunner,
  ShipItPushPhase,
  ShipItYarnPhase,
};

use \Facebook\ImportIt\ {
  ImportItSyncPhase,
};

class ImportNEOTracker {

  public static function filterChangeset(
    ShipItChangeset $changeset,
  ): ShipItChangeset {
    return $changeset
      |> ImportItPathFilters::moveDirectories(
          $$,
          NEOTrackerUtils::getPathMappings(),
        );
  }

  public static function cliMain(): void {
    (new ShipItPhaseRunner(
      (new ShipItBaseConfig(
        /* default working dir = */ '/var/tmp/shipit',
        'neotracker',
        'neotracker-internal',
        ImmSet { },
      )),
      ImmVector {
        new ShipItGitHubInitPhase(
          'neotracker',
          'neotracker-internal',
          ShipItRepoSide::DESTINATION,
          ShipItTransport::SSH,
          NEOTrackerGitHubUtils::class,
        ),
        new ShipItCleanPhase(ShipItRepoSide::DESTINATION),
        new ShipItPullPhase(ShipItRepoSide::DESTINATION),
        new ShipItGitHubInitPhase(
          'neotracker',
          'neotracker',
          ShipItRepoSide::SOURCE,
          ShipItTransport::SSH,
          NEOTrackerGitHubUtils::class,
        ),
        new ShipItCleanPhase(ShipItRepoSide::SOURCE),
        new ShipItPullPhase(ShipItRepoSide::SOURCE),
        new ImportItSyncPhase(
          ($config, $changeset) ==> self::filterChangeset($changeset),
        ),
      },
    ))
      ->run();
  }
}

ImportNEOTracker::cliMain();
