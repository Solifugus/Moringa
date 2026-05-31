#!/bin/bash

# Moringa Script VS Code Extension Installer
# This script installs the Moringa syntax highlighting extension for VS Code

set -e

echo "🚀 Installing Moringa Script syntax highlighting for VS Code..."

# Determine the correct VS Code extensions directory
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    EXTENSIONS_DIR="$APPDATA/Code/User/extensions"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    EXTENSIONS_DIR="$HOME/.vscode/extensions"
else
    # Linux and others
    EXTENSIONS_DIR="$HOME/.vscode/extensions"
fi

# Create target directory
TARGET_DIR="$EXTENSIONS_DIR/moringa-script-1.0.0"
echo "📁 Creating extension directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Copy extension files
echo "📋 Copying extension files..."
cp vscode/package.json "$TARGET_DIR/"
cp vscode/moringa.tmLanguage.json "$TARGET_DIR/"
cp vscode/language-configuration.json "$TARGET_DIR/"
cp vscode/snippets.json "$TARGET_DIR/"

# Create a simple README for the extension
cat > "$TARGET_DIR/README.md" << 'EOF'
# Moringa Script Language Support

This extension provides syntax highlighting and language support for Moringa chatbot script files (.pgm).

## Features

- Syntax highlighting for Moringa script keywords, variables, and strings
- Code snippets for common patterns
- Auto-completion and bracket matching
- Smart indentation
- Code folding for contexts and sequences

## Usage

Open any `.pgm` or `.moringa` file to automatically enable syntax highlighting.

Use the built-in snippets by typing trigger words like:
- `rec` - Basic recognizer
- `context` - Context definition
- `timer` - Timer pattern
- And many more...

## Source

Part of the Moringa chatbot engine: https://github.com/Solifugus/Moringa
EOF

echo "✅ Moringa Script extension installed successfully!"
echo "🔄 Please restart VS Code to activate the extension."
echo ""
echo "📝 Usage:"
echo "   - Open any .pgm file to see syntax highlighting"
echo "   - Use snippets by typing 'rec', 'context', 'timer', etc."
echo "   - Enjoy enhanced Moringa script development!"

# Check if VS Code is running and warn user
if pgrep -x "code" > /dev/null || pgrep -x "Code" > /dev/null; then
    echo ""
    echo "⚠️  VS Code appears to be running. Please restart it to load the extension."
fi