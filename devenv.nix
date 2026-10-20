{ pkgs, ... }:
{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  packages = with pkgs; [
    svelte-language-server
    vtsls
    oxfmt
  ];
}
