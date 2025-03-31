{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  packages = [
    pkgs.pantheon.elementary-iconbrowser
  ];
}
