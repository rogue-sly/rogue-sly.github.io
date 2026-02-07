---
title: "Alternatives to Mason.nvim"
desc: "Looking for another way to manage tools in nvim"
date: "2025-06-04"
tags: ["package manager", "tool manager", "neovim", "tooling"]
published: true
---

<script>
  import Asciinema from "$lib/components/Asciinema.svelte"
</script>

# Why?

First, I gotta say that mason.nvim really simplifies installing & managing tools plus it covers huge amount of packages, but personally, I've always been a fan of the unix philosophy "do one thing well", and I find an editor plugin doing all that kind of work is something a plugin shouldn't really do.

I still use mason.nvim on termux because unfortunately, it's not possible to use these tools on termux. Well actually you can but you need to use proot-distro for this and it's veeeeeeeeeery slow.

You might be wondering why even bother? Well, mason.nvim when it comes to security isn't that good. All it does is simply downloading a package and making it available in $PATH for neovim to use. It makes installing things easy but that's all it does pretty much. It doesn't even try to version lock packages.

So if you're looking for a separate tool for managing installations of `language servers`, `formatters`, `linters` and `other cli tools`, you may wanna keep reading.

## Alternatives

### 1. Default Package Manager

Most linux distros software repositories offer some tooling but it's often quite lacking and this is why mason.nvim exists.

It's also possible to use the package manager associated with said tool to install said language server or formatter for that tool(e.g. `npm install -g typescript-language-server`). Doesn't take a genius to figure that out, but it's kinda annoying and requires the user to update every tool manually.

I guess you could argue it's possible to use shell scripts to automate that process of installing and updating these tools, but it's kinda flaky and breaks easily.

### 2. ![tool-logo](/posts/alternatives-to-mason-nvim/mise.svg) [mise-en-place](https://mise.jdx.dev/)

<Asciinema src="/posts/alternatives-to-mason-nvim/mise.cast" />

This one is basically [asdf](https://asdf-vm.com/), but offers more than what asdf offers, and supports installing straight from github and other git hosting services like gitlab and codeberg (I'll talk more on that later). This tool works very similarly to mason.nvim but it's more flexible in the sense that you can use it not only with vim/nvim but with other editors like helix for example.

Mise highlights itself as a polyglot tool manager. It uses `toml` for configuration which makes it very easy to use and setup. Lemme show you how the config file looks like:

```toml
[tools]
# shell
shfmt = "latest"
shellcheck = "latest"
"npm:bash-language-server" = "5.6.0"
stylua = "latest"
"github:EmmyLuaLs/emmylua-analyzer-rust" = "latest"
ruff = "latest"
ty = "latest"
uv = "latest"
"github:docker/docker-language-server" = "latest"
"github:sqls-server/sqls" = "latest"
flutter = "latest"
gemini-cli = "latest"

[settings]
cargo.binstall = true
experimental = true
jobs = 4
npm.bun = true
paranoid = false
verbose = false
```

#### Installing mise

Here's how to install mise on fedora

```sh
sudo dnf copr enable jdxcode/mise
sudo dnf install mise
```

It's also possible to install mise from [terra repos](https://terra.fyralabs.com/). Here's how:

```sh
# add terra repository to dnf
sudo dnf install --nogpgcheck --repofrompath 'terra,https://repos.fyralabs.com/terra$releasever' terra-release
sudo dnf install mise
```

Terra comes with a lot more packages, so I suggest looking more into it.

Anyway, I'm not going to cover every linux distro/OS out there so consider looking at this page:

[https://mise.jdx.dev/getting-started.html](https://mise.jdx.dev/getting-started.html)

And please don't use `curl` for installing programs directly on your system!

After you're done installing mise, you should load it into your shell, and you can do this by running one of these commands:

```bash
# bash
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
```

```zsh
# zsh
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
```

```fish
# fish
echo 'mise activate fish | source' >> ~/.config/fish/config.fish
```

And now you can run any program installed by mise in your shell :D

Now I'll cover two things about mise which are the global config and project-local config

#### 1. Global Config `~/.config/mise/config.toml`

To install a package globally, run `mise use -g <package>`.

You can also select a package by running `mise use -g` without specifying a package and it will show a selection menu that lets you pick the package that you want

#### 2. Project Local Config `mise.toml`

Running `mise use <package>` will add the package to mise.toml in the current working directory, and that package will only be available when you `cd` into that directory.

### 3. ![tool-logo](/posts/alternatives-to-mason-nvim/brew.svg) [Brew/LinuxBrew](https://brew.sh/)

I didn't use this much but it's simply an alternative package manager written in ruby. It creates a folder in `/home/` that contains all the packages and system libraries that these packages may require. You don't have to use your system package manager as brew provides those system libraries itself which you can argue it's nice but that means you'll be downloading some extra stuff on your system.

It's one of the easiest ones to use as it's simply just a regular package manager with no special things added to it other than that.

`brew install lua-language-server` package and that's about it.

It covers a decent chunk of language servers, linters and formatters; however, there's a tiny thing I don't like about brew:

![macOS fanboy package manager](/posts/alternatives-to-mason-nvim/brew-really-loves-macos.png)

It favors macOS over linux sometimes.

### 4. ![tool-logo](/posts/alternatives-to-mason-nvim/nix.png) [Nix Package Manager](https://nixos.org/)

This one may take some time as you'll have to learn the nix language. It's kind of a weird language but not that hard as some may claim.

Very cool thing about nix package manager is that it has one of the biggest software repositories in the world! You can be well certain that all the packages you need are available in there.

![repology-repo-sizes-graph](/posts/alternatives-to-mason-nvim/repos_size_graph.svg)

On modern installations of fedora (Fedora +42), you can install nix from the official fedora repositories.

If you happen to be on older version of fedora (seriously, update your system), I recommend installing this flavor of nix called [determinate nix](https://github.com/DeterminateSystems/nix-installer). It plays nicely with SELinux. This is what I used to use before fedora included nix in their repositories.

Why I don't use nix? Well... I find mise a lot easier to use and doesn't twist my arms like nix does sometimes.

I had instances where I was compiling something using rust (installed by nix), and for some reason it couldn't find the system libraries needed to compile the damn thing. I assume that's fixed now that they added nix in the official repos (I hope). It was one of the things that really killed the nix experience for me. No. I'm not switching to NixOS. I'm happy with fedora and I want to keep using fedora. I did in-fact use NixOS for quite a while until my wifi drivers decided to stop working and had no option other than to go back to fedora.

While I love nix (the package manager), I hate and despise nix (the language). I find it a bit of an eye sore to read sometimes.

![nix taking forever to install things](/posts/alternatives-to-mason-nvim/nix-packages-taking-too-long-to-install.png)

Yeah just like brew, nix pulls it's own system libraries, but for some reason it pulls soo much stuff it literally kills my internet.

<style>
    img[alt="tool-logo"] {
        vertical-align: middle;
        width: 50px;
    }
</style>
