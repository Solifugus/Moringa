# Vim Syntax Support for Moringa Scripts

This directory contains Vim syntax highlighting for Moringa script files (`.pgm` and `.moringa`).

## Installation

### Manual Installation

1. Copy the syntax file to your Vim syntax directory:
   ```bash
   mkdir -p ~/.vim/syntax
   cp moringa.vim ~/.vim/syntax/
   ```

2. Add filetype detection to your `.vimrc` or create a filetype plugin:
   ```bash
   mkdir -p ~/.vim/ftdetect
   echo 'au BufRead,BufNewFile *.pgm,*.moringa set filetype=moringa' > ~/.vim/ftdetect/moringa.vim
   ```

### Using a Plugin Manager

#### vim-plug
Add to your `.vimrc`:
```vim
Plug 'Solifugus/Moringa', {'rtp': 'syntax/vim'}
```

#### Vundle
Add to your `.vimrc`:
```vim
Plugin 'Solifugus/Moringa'
```

## Features

- **Syntax Highlighting**: Keywords, strings, variables, comments
- **Variable Recognition**: Highlights `[variable]` and `[var:choice1,choice2]` patterns
- **Code Folding**: Context, sequence, and recognizer blocks
- **Smart Indentation**: Automatic indentation for nested blocks
- **Comment Support**: Line comments with `--`

## Customization

You can customize colors by adding to your `.vimrc`:

```vim
" Custom Moringa syntax colors
hi moringaDirective ctermfg=blue guifg=#0000ff
hi moringaAction ctermfg=green guifg=#00ff00
hi moringaVariable ctermfg=yellow guifg=#ffff00
```

## Usage

Once installed, Vim will automatically recognize `.pgm` and `.moringa` files and apply syntax highlighting.

### Folding

The syntax file enables folding for major blocks. Use these commands:
- `zo` - Open fold
- `zc` - Close fold
- `zR` - Open all folds
- `zM` - Close all folds