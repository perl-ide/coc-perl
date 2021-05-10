I don't write perl as much as I used to, so I'm losing motivation. I would appreciate it if you could create fork rather than submitting an issue.

# coc-perl

Perl Language Server for [coc.nvim](https://github.com/neoclide/coc.nvim).

This is a fork from [richterger/Perl-LanguageServer](https://github.com/richterger/Perl-LanguageServer/tree/master/clients/vscode/perl).

<img width='400' alt="coc-perl" src="https://user-images.githubusercontent.com/41639488/93008922-91aad880-f5b5-11ea-995b-3097806a4327.png">

## Installation

### Requirements

You need to install the perl module Perl::LanguageServer to make this extention working,
e.g. run "cpan Perl::LanguageServer" on your target system.

Please make sure to always run the newest version of Perl::LanguageServer as well.

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
Plug 'ulwlu/coc-perl', {'do': 'yarn install && yarn build'}
```

## Features

* Syntax checking
* Symbols in file
* Symbols in workspace/directory
* Goto Definition
* Find References
* Call Signatures

[See More](https://github.com/richterger/Perl-LanguageServer/tree/master/clients/vscode/perl#extension-settings).
