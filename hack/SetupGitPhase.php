<?hh // strict
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
namespace NEOTracker;

require __DIR__.'/vendor/autoload.php';

use \Facebook\ShipIt\ {
  ShipItBaseConfig,
  ShipItChangeset,
  ShipItDestinationRepo,
  ShipItRepo,
  ShipItRepoSide,
  ShipItRepoGIT,
  ShipItShellCommand,
};

final class SetupGitPhase extends \Facebook\ShipIt\ShipItPhase {

  public function __construct(
    private ShipItRepoSide $side
  ): void {
  }

  <<__Override>>
  protected function isProjectSpecific(): bool {
    return false;
  }

  <<__Override>>
  final public function getReadableName(): string {
    return 'Setup git';
  }

  <<__Override>>
  final protected function runImpl(
    ShipItBaseConfig $config,
  ): void {
    $path =
      $this->side === ShipItRepoSide::SOURCE
        ? $config->getSourcePath()
        : $config->getDestinationPath();

    $user = (new ShipItShellCommand(
      $path,
      'git',
      'config',
      '--get',
      'user.name',
    ))->runSynchronously()->getStdOut();
    $email = (new ShipItShellCommand(
      $path,
      'git',
      'config',
      '--get',
      'user.email',
    ))->runSynchronously()->getStdOut();
    (new ShipItShellCommand(
      $path,
      'git',
      'config',
      'user.name',
      $user,
    ))->runSynchronously();
    (new ShipItShellCommand(
      $path,
      'git',
      'config',
      'user.email',
      $email,
    ))->runSynchronously();
  }
}
