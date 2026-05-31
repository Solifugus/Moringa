# Moringa Script Syntax Highlighting

This directory provides syntax highlighting support for Moringa script files (`.pgm` and `.moringa`) across multiple editors and IDEs.

## 🎨 Supported Editors

| Editor/IDE | Status | Location | Installation |
|------------|---------|----------|-------------|
| **VS Code** | ✅ Ready | `vscode/` | Extension or manual |
| **Vim/Neovim** | ✅ Ready | `vim/` | Manual or plugin manager |
| **Sublime Text** | ✅ Ready | `textmate/` | Package manager |
| **Atom** | ✅ Ready | `textmate/` | Package manager |
| **TextMate** | ✅ Ready | `textmate/` | Bundle |

## 🚀 Quick Start

### VS Code (Recommended)

**Option 1: Install as Extension (Recommended)**
1. Copy the `vscode/` directory to your VS Code extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\moringa-script\`
   - **macOS**: `~/.vscode/extensions/moringa-script/`
   - **Linux**: `~/.vscode/extensions/moringa-script/`
2. Restart VS Code
3. Open any `.pgm` file to see syntax highlighting

**Option 2: Manual Installation**
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Configure User Snippets"
3. Select "New Global Snippets file"
4. Copy contents from `vscode/snippets.json`

### Vim/Neovim

```bash
# Copy syntax file
mkdir -p ~/.vim/syntax
cp vim/moringa.vim ~/.vim/syntax/

# Add filetype detection
mkdir -p ~/.vim/ftdetect
echo 'au BufRead,BufNewFile *.pgm,*.moringa set filetype=moringa' > ~/.vim/ftdetect/moringa.vim
```

See `vim/README.md` for detailed instructions.

### Sublime Text

1. Install Package Control if you haven't already
2. Copy `textmate/moringa.tmGrammar` to your User packages directory:
   - **Windows**: `%APPDATA%\Sublime Text\Packages\User\`
   - **macOS**: `~/Library/Application Support/Sublime Text/Packages/User/`
   - **Linux**: `~/.config/sublime-text/Packages/User/`
3. Restart Sublime Text

## 🎯 Features

### Syntax Highlighting

All implementations provide highlighting for:

- **Directives**: `context`, `recognizer`, `sequence`, `memories`, `conjugate`, `synonym`
- **Actions**: `say`, `remember`, `recall`, `forget`, `expect`, `enter`, `exit`, `do`
- **Conditionals**: `always`, `option`, `open`, `fallback`, `nonexclusive`
- **Variables**: `[variable]` and `[var:choice1,choice2,choice3]` patterns
- **Strings**: Double-quoted strings with escape sequences
- **Comments**: Line comments starting with `--`
- **Numbers**: Integers, decimals, and time formats
- **Keywords**: Logical operators, prepositions, time units

### VS Code Exclusive Features

- **IntelliSense**: Auto-completion for keywords and patterns
- **Code Snippets**: Pre-defined templates for common patterns
- **Bracket Matching**: Automatic closing of brackets and quotes
- **Code Folding**: Collapsible sections for contexts and sequences
- **Smart Indentation**: Context-aware indentation

### Example Highlighting

```moringa
-- This is a comment
context "greeting"
    recognizer "hello [name]"
        remember "user name is [name]"
        say "Hello, [name]! Nice to meet you."
        
    recognizer "set timer for [duration] [unit:seconds,minutes,hours]"
        say "Timer set for [duration] [unit]."
        say "Time's up!" in "[duration] [unit]"
```

## 🛠 Development

### Adding New Keywords

To add new keywords to the highlighting:

1. **VS Code**: Edit `vscode/moringa.tmLanguage.json`
2. **Vim**: Edit `vim/moringa.vim`
3. **TextMate**: Edit `textmate/moringa.tmGrammar`

### Testing

Test syntax highlighting with the included examples:

```bash
# Test with example files
code examples/synthia.pgm                    # VS Code
vim examples/traits/eliza.pgm                # Vim
subl examples/traits/smalltalk.pgm           # Sublime Text
```

## 📝 VS Code Snippets Reference

| Trigger | Description | Expands to |
|---------|-------------|------------|
| `rec` | Basic recognizer | `recognizer "pattern"` with response |
| `recvar` | Variable recognizer | Recognizer with variable capture |
| `remember` | Memory storage | Pattern for storing information |
| `recall` | Memory recall | Pattern for retrieving information |
| `context` | Context definition | New context block |
| `enter`/`exit` | Context switching | Enter/exit context patterns |
| `sequence` | Sequence definition | Reusable command sequence |
| `timer` | Timer pattern | Scheduled action template |
| `conditional` | Conditional logic | If-then-else pattern |
| `choice` | Choice variable | Variable with predefined options |

## 🔧 Customization

### VS Code Theme Support

The syntax highlighting works with all VS Code themes. For custom colors, add to your `settings.json`:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "keyword.control.directive.moringa",
        "settings": {
          "foreground": "#0066cc",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "variable.other.moringa",
        "settings": {
          "foreground": "#ff6600"
        }
      }
    ]
  }
}
```

### Vim Color Schemes

Customize Vim colors in your `.vimrc`:

```vim
" Custom Moringa colors
hi moringaDirective ctermfg=blue guifg=#0066cc
hi moringaAction ctermfg=green guifg=#00aa00
hi moringaVariable ctermfg=yellow guifg=#ff6600
hi moringaString ctermfg=red guifg=#cc0000
```

## 🤝 Contributing

To improve syntax highlighting:

1. Test with various Moringa script examples
2. Check for missing keywords or patterns
3. Ensure consistent behavior across editors
4. Submit issues or PRs to the main repository

## 📋 File Types

The syntax highlighting automatically activates for:
- `.pgm` files (standard Moringa scripts)
- `.moringa` files (alternative extension)

## 🔗 Related

- [Main Moringa Documentation](../README.md)
- [Getting Started Guide](../docs/getting-started.md)
- [Example Scripts](../examples/)
- [Language Reference](../README.md#script-reference)