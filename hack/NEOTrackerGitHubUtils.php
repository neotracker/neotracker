<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';

class NEOTrackerGitHubUtils extends \Facebook\ShipIt\ShipItGitHubUtils {
  public static function getCredentialsForProject(
    string $organization,
    string $project,
  ): ShipItGitHubCredentials {
    return null;
  }
}
