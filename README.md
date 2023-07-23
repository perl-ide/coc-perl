# coc-perl

Perl Language Server for [coc.nvim](https://github.com/neoclide/coc.nvim).

This project is based on the official VSCode extension maintained at
[Perl-LanguageServer](https://github.com/richterger/Perl-LanguageServer/tree/master/clients/vscode/perl).

<img width='400' alt="coc-perl" src="https://user-images.githubusercontent.com/41639488/93008922-91aad880-f5b5-11ea-995b-3097806a4327.png">

## Installation

### Requirements

You need to install the perl module Perl::LanguageServer to make this extention working, e.g. run "cpan
Perl::LanguageServer" on your target system or in your local library path in case you're using
[PerlBrew](https://github.com/gugod/App-perlbrew).

### CocInstall

Inside (neo)vim run this command:

```vim
:CocInstall coc-perl
```

or, you can set `g:coc_global_extensions`.

```vim
let g:coc_global_extensions = [
      \ 'coc-perl',
\ ]
```

### vim-plug

```vim
Plug 'bmeneg/coc-perl', {'do': 'yarn install && yarn build'}
```

### User options

As user, you can change and pass different options to the language server, however, the options are tied to the server
version being used. Because of that, make sure to always run the newest version of Perl::LanguageServer as well or at
least the version supported here (`2.6.0`), in case the language server moves faster than this project.

The options are placed in the `coc-settings.json` (which can be opened directly issuing `:CocConfig`) and has the following format:

```json
{
    "perl.enable": true,
    "perl.logFile":  "~/coc-perl.log",
    "perl.logLevel": 2
}
```

The available options are exactly the same exposed by the 
[language server](https://github.com/richterger/Perl-LanguageServer/tree/master/clients/vscode/perl#extension-settings). 
It's even possible that if you find a bug with the options, this might also be a bug in the language server itself.

## Features

* Syntax checking
* Symbols in file
* Symbols in workspace/directory
* Goto Definition
* Find References
* Call Signatures

[See More](https://github.com/richterger/Perl-LanguageServer/tree/master/clients/vscode/perl#extension-settings).

## Differences from VSCode extension

Unfortunatelly not all features supported in the original VSCode extension are available in `coc-perl` due to the
differences between VSCode extension core code and `coc-nvim` code. The Language Server Protocol is fully compatible,
however the [Debug Adapter Protocol (DAP)](https://microsoft.github.io/debug-adapter-protocol/) is missing from
`coc-nvim`, cause the features related to "debugging" the code non-existent on neovim.

For those navigating the extension code will notice some "DAP-related" variables are defined and "used", but in
reality they have no operation at all, serving just as placeholders to allow transparent use of VSCode extension
configuration file. Working is being done in different fronts to get DAP support to neovim as soon as possible, but a
third plugin might be required (besides `coc-nvim` and `coc-perl`).

Whenever a decent and full-featured support lands through another project, instructions will be presented in this
README file.

## Maintainers

[bmeneg](https://github.com/bmeneg) - Maintainer  
[ulwlu](https://github.com/ulwlu) - Project creator and former maintainer
