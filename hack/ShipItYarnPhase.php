<?hh

namespace Facebook\ShipIt;

final class ShipItYarnPhase extends ShipItPhase {
  public function __construct(
    private ShipItRepoSide $side,
  ) {}

  <<__Override>>
  protected function isProjectSpecific(): bool {
    return false;
  }

  <<__Override>>
  final public function getReadableName(): string {
    return 'Refresh '.$this->side.' yarn';
  }

  <<__Override>>
  final public function getCLIArguments(): ImmVector<ShipItCLIArgument> {
    return ImmVector {
      shape(
        'long_name' => 'skip-'.$this->side.'-yarn',
        'description' => 'Do not run yarn install on '.$this->side,
        'write' => $_ ==> $this->skip(),
      ),
    };
  }

  <<__Override>>
  final protected function runImpl(ShipItBaseConfig $config): void {
    switch ($this->side) {
      case ShipItRepoSide::SOURCE:
        $local_path = $config->getSourcePath();
        break;
      case ShipItRepoSide::DESTINATION:
        $local_path = $config->getDestinationPath();
        break;
    }

    (new ShipItShellCommand(
      $local_path,
      'yarn',
      'install',
    ))->runSynchronously();
  }
}
