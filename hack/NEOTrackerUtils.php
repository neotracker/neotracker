<?hh

namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';

class NEOTrackerUtils
  implements \Facebook\ImportIt\ImportItPathMappings {

  public static function getPathMappings(): ImmMap<string, string> {
    return ImmMap {
      'package.oss.json' => 'package.json',
      'yarn.oss.lock' => 'yarn.lock',
      '.circleci.oss' => '.circleci',
      'jest.config.oss.js' => 'jest.config.js',
    };
  }
}
