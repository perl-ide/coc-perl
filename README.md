# coc-perl

Perl Language client for Language Server Protocol through [coc.nvim](https://github.com/neoclide/coc.nvim).

<img width='400' alt="coc-perl" src="https://user-images.githubusercontent.com/41639488/93008922-91aad880-f5b5-11ea-995b-3097806a4327.png">

## Language Servers support

This project supports two different language servers:

1. [Perl-LanguageServer](https://github.com/richterger/Perl-LanguageServer);
2. [PerlNavigator](https://github.com/bscan/PerlNavigator).

Being that each has its own characteristics and are differentiated through the way you enable and configure them in
CoC configuration file.

## Installation

In the current version of coc-perl, both supported language servers are automatically installed in case you don't have
it already, meaning you only need to define which server you want to enable in CoC configuration. However, for
`Perl::LanguageServer` it depends if you've [local::lib](https://metacpan.org/pod/local::lib) set in your system or
not: if you have it set manually or through some other installation/dependency management tool, like
[PerlBrew](https://perlbrew.pl/), [Carton](https://metacpan.org/pod/Carton), [Carmel](https://metacpan.org/pod/Carmel), etc, the automatic installation should happen without any
problems, since the server will be placed in a local directory, that your user has access to; on the other hand,
without it set, the installation is required to be manually executed as root, as described by its own [documentation](https://github.com/richterger/Perl-LanguageServer?tab=readme-ov-file#requirements).

### Prerequisites

For Perl::LanguageServer you need to have `cpan` installed in your host system. The way coc-perl installs it is by
executing `cpan Perl::LanguageServer` with a specific version (the latest supported version). However, you can
manually install it on your system or your local library path in case you're using, preventing any installation done by coc-perl.

Now, for PerlNavigator, coc-perl also handles it automatically, but it requires `git` to be installed. In case you
decide to install it manually, since it's not present in CPAN and its initialization is entirely written in TypeScript
rather than Perl, you need to follow what's described on [PerlNavigator
repository](https://github.com/bscan/PerlNavigator/tree/main#installation-for-other-editors) about installing it on
other editors. In summary, you need to clone the repository, install the server running the `npx tsc` command from
within server's folder and take note of the absolute path for the generated code, for instance
`/home/<user>/PerlNavigator/server/out/server.js`, which will be needed when configuring CoC later on.

### Installing coc-perl

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
or even install directly via any plugin manager, for example, with [vim-plug](https://github.com/junegunn/vim-plug):
```vim
Plug 'bmeneg/coc-perl'
```

#### Automatic language server installation

When coc-perl is installed for the first time, you probably won't have any configuration referring to what language
server you want to enable, thus neither Perl::LanguageServer nor PerlNavigator will be installed. Make sure to after
installing coc-perl, enable one of the servers in coc.nvim configuration file (keep reading the next sections to know
how perform such action) and then reopen a Perl file or, in case you're already with a Perl file opened, call
`:CocRestart`, so the automatic installation process can take place considering the choice you made regarding the
language server.

## Choosing a Language Server

To enable a language server an option must be added to the `coc-settings.json` file, which can be accessed through the
(neo)vim command `:CocConfig`. However, before directly enabling them, it's important to understand how the
configuration properties are defined for each server.

### Configuration properties

As said before, coc-perl supports two different Perl language servers: _Perl::LanguageServer_ (hereafter referred as
`pls`) and _PerlNavigator_ (hereafter referred as `navigator`). Each has its own set of options to be set on
`:CocConfig` and coc-perl support them completely.

For those using `pls`, configuration options are set under the `perl.*` namespace, while for `navigator`, the
namespace `perlnavigator.*` is used.

#### Deprecation/removal notice

In the coc-perl version `2.x`, there was an effort to also support coc-specific namespaces, like `perl.p::ls.*` for
_Perl::LanguageServer_ and `perl.navigator.*` for _PerlNavigator_. However, after some time, the burden to keep both
default and coc-perl specific namespace has proven not to be worth. With that, we have completely removed its support
in version `3.x`.

### Enabling one server

Only one language server can be enabled at a time. In case both are enabled, an error will be prompted on
`:CocOpenLog` and no server action will be seen on (neo)vim's buffer.

For enabling `pls`, you can use either options (the first is preferred):

```json
{
    "perl.enable": true
}
```

And for `navigator`:

```json
{
    "perlnavigator.enable": true,
}
```

If you're using a development branch of `navigator`, manually downloaded and/or installed, you'll need one additional
option: the server absolute path.
```json
    "perlnavigator.serverPath": "/home/<user>/PerlNavigator/server/out/server.js"
```

### Other options

As user, you can change and pass different options to each language server, however, the options are tied to the
server version being used. Because of that, make sure to always run the newest version of the server alongside the
coc-perl extension. A brief example of using different options are as follows:
```json
{
    "perl.enable": true,
    "perl.logLevel": 2,
    "perl.logFile": "/home/<user>/coc-perl.log",

    "perlnavigator.enable": false,
    "perlnavigator.serverPath": "/home/<user>/PerlNavigator/server/out/server.js"
}
```

You can have options for both servers in the configuration file, but only one server can be enabled at a time, meaning
that options for the disabled server won't reach the enabled server.

For a detailed list of all options, please visit
[PerlNavigator](https://github.com/bscan/PerlNavigator/tree/main#perl-paths) and
[Perl-LanguageServer](https://github.com/richterger/Perl-LanguageServer#extension-settings) repositories.

## Differences from VSCode extension

Unfortunatelly not all features supported in the original VSCode extension are available in coc-perl due to the
differences between VSCode extension core code and `coc.nvim`. Although Language Server Protocol is fully compatible,
the [Debug Adapter Protocol (DAP)](https://microsoft.github.io/debug-adapter-protocol/) is missing from
`coc.nvim`, cause the features related to lauching and debugging Perl code non-existent on (neo)vim through coc-perl.

For those navigating the extension code will notice some "DAP-related" variables are defined and "used", but in
reality they have no operation at all, serving just as placeholders to allow transparent use of VSCode extension
configuration file. Working is being done in different fronts to get DAP support to neovim as soon as possible, but a
third plugin might be required (besides `coc.nvim` and coc-perl).

Whenever a decent and full-featured support lands through another project, instructions will be presented in this
README file.

## Troubleshooting

Before filling an issue, it's important to gather some information to use as entry point.
Make sure to copy the contents from `:CocConfig`, `:CocOpenLog` and `:CocCommand workspace.showOutput`.

`:CocConfig` is important to understand how you're trying to use the extension and the server. `:CocOpenLog` shows the
log for `coc.nvim` itself, when trying to initialize the extension and the server. Finally, when issuing `:CocCommand
workspace.showOutput` a selections window will pop up to choose the server (`Perl::LanguageServer` or `PerlNavigator`)
and, once you have done that, any errors from the server will be shown in a new buffer. Only then, an issue can be
filled with all this information presented inline.

But remember, server's code are far more complicated than this client extension, meaning that most of the bugs will be
related to the server. Make sure to search for the symptoms you're experiencing in server's repository either.

## Maintainers

[bmeneg](https://github.com/bmeneg) - Maintainer  
[ulwlu](https://github.com/ulwlu) - Project creator and former maintainer
