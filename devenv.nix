{
  lib,
  pkgs,
  ...
}:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
    lsp.enable = true;
  };

  packages = with pkgs; [
    svelte-language-server
    vtsls
    oxfmt
  ];
}
