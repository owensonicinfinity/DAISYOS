#!/bin/bash

# DAISY OS Installation Script for Termux
# This script unzips and installs everything in the DAISYOS folder

echo "=========================================="
echo "DAISY OS - Termux Installation Script"
echo "=========================================="
echo ""

# Define paths
STORAGE_PATH="$HOME/storage/shared/DAISYOS"
INSTALL_PATH="$HOME/DAISYOS-Install"

# Check if storage is accessible
if [ ! -d "$STORAGE_PATH" ]; then
    echo "❌ ERROR: DAISYOS folder not found at $STORAGE_PATH"
    echo "Please make sure:"
    echo "1. You've granted Termux storage permissions"
    echo "2. The DAISYOS folder exists in your internal storage"
    echo ""
    echo "If you haven't granted permissions yet, run:"
    echo "termux-setup-storage"
    exit 1
fi

echo "✅ Found DAISYOS folder at: $STORAGE_PATH"
echo ""

# Create installation directory
mkdir -p "$INSTALL_PATH"
echo "📁 Created installation directory: $INSTALL_PATH"
echo ""

# Copy files from storage
echo "📋 Copying files from storage..."
cp -r "$STORAGE_PATH"/* "$INSTALL_PATH/" 2>/dev/null

cd "$INSTALL_PATH"
echo "✅ Changed to installation directory"
echo ""

# Find and unzip all .zip files
echo "📦 Looking for zip files to extract..."
zip_count=$(find . -name "*.zip" | wc -l)

if [ $zip_count -gt 0 ]; then
    echo "Found $zip_count zip file(s)"
    find . -name "*.zip" | while read zip_file; do
        echo "🔓 Unzipping: $zip_file"
        unzip -q "$zip_file" -d "$(dirname "$zip_file")"
        rm "$zip_file"
        echo "✅ Extracted and removed: $zip_file"
    done
else
    echo "⚠️  No zip files found"
fi

echo ""
echo "=========================================="
echo "Checking for package managers..."
echo "=========================================="
echo ""

# Update package managers
echo "🔄 Updating apt packages..."
apt update -y
apt upgrade -y

# Check for Node.js project
if [ -f "package.json" ]; then
    echo "✅ Found package.json - Node.js project detected"
    echo "📦 Installing Node.js dependencies..."
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        apt install -y nodejs
    fi
    
    npm install
    echo "✅ Node.js dependencies installed"
    echo ""
fi

# Check for Python project
if [ -f "requirements.txt" ]; then
    echo "✅ Found requirements.txt - Python project detected"
    echo "📦 Installing Python dependencies..."
    
    # Install Python if not present
    if ! command -v python &> /dev/null; then
        echo "Installing Python..."
        apt install -y python
    fi
    
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
    echo ""
fi

# Check for other common files
if [ -f "setup.py" ]; then
    echo "✅ Found setup.py"
    python setup.py install
    echo "✅ setup.py executed"
    echo ""
fi

if [ -f "Makefile" ]; then
    echo "✅ Found Makefile"
    make
    echo "✅ Makefile executed"
    echo ""
fi

if [ -f "Dockerfile" ]; then
    echo "⚠️  Found Dockerfile (Docker not available in Termux)"
    echo "You may need to install this manually"
    echo ""
fi

# List what was installed
echo "=========================================="
echo "📂 Installation Complete!"
echo "=========================================="
echo ""
echo "Installation directory: $INSTALL_PATH"
echo ""
echo "📋 Contents:"
ls -la "$INSTALL_PATH" | head -20

echo ""
echo "✅ Ready to use! Navigate with:"
echo "cd $INSTALL_PATH"
echo ""
