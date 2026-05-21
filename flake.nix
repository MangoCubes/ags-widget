{
  description = "Typescript development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = false;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = (
            with pkgs;
            [
              typescript
              nodejs
              bashInteractive
            ]
          );
          shellHook =
            let
              initFile = pkgs.writeText ".bashrc" ''
                echo "Typescript shell activated!"
                set -a
                  hw() { echo "Hello world!"; }
                set +a
              '';
            in
            ''
              bash --init-file ${initFile}; exit
            '';
        };
      }
    );
}
