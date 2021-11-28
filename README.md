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
least the version supported here (`2.3.0`), in case the language server moves faster than this project.

The options are placed in the `coc-settings.json` (which can be opened directly issuing `:CocConfig`) and has the following format:

```json
{
    "perl": {
        "enable": true,
        "debugAdapterPort": "13604"
        "logLevel": 1,
    }
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

## Maintainers

[bmeneg](https://github.com/bmeneg) - Maintainer  
[ulwlu](https://github.com/ulwlu) - Project creator and former maintainer
