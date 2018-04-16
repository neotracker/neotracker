<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';
require __DIR__.'/NEOTrackerGitHubUtils.php';
require __DIR__.'/NEOTrackerUtils.php';
require __DIR__.'/SetupGitPhase.php';

use \Facebook\ShipIt\ {
  ShipItBaseConfig,
  ShipItChangeset,
  ShipItCleanPhase,
  ShipItDeleteCorruptedRepoPhase,
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
      |> \Facebook\ImportIt\ImportItPathFilters::moveDirectories(
          $$,
          NEOTrackerUtils::getPathMappings(),
        );
  }

  public static function cliMain(): void {
    (new ShipItPhaseRunner(
      (new ShipItBaseConfig(
        /* default working dir = */ '~/shipit',
        'neotracker',
        'neotracker-internal',
        ImmSet { },
      )),
      ImmVector {
        new ShipItDeleteCorruptedRepoPhase(ShipItRepoSide::DESTINATION),
        new ShipItDeleteCorruptedRepoPhase(ShipItRepoSide::SOURCE),
        new ShipItGitHubInitPhase(
          'neotracker',
          'neotracker-internal',
          ShipItRepoSide::DESTINATION,
          ShipItTransport::SSH,
          NEOTrackerGitHubUtils::class,
        ),
        new ShipItCleanPhase(ShipItRepoSide::DESTINATION),
        new ShipItPullPhase(ShipItRepoSide::DESTINATION),
        new SetupGitPhase(ShipItRepoSide::DESTINATION),
        new ShipItGitHubInitPhase(
          'neotracker',
          'neotracker',
          ShipItRepoSide::SOURCE,
          ShipItTransport::SSH,
          NEOTrackerGitHubUtils::class,
        ),
        new ShipItCleanPhase(ShipItRepoSide::SOURCE),
        new ShipItPullPhase(ShipItRepoSide::SOURCE),
        new SetupGitPhase(ShipItRepoSide::SOURCE),
        new ImportItSyncPhase(
          ($changeset) ==> self::filterChangeset($changeset),
        ),
      },
    ))
      ->run();
  }
}

ImportNEOTracker::cliMain();
