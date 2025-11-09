# Switcheroo

A display switcher application specifically designed for Nintendo Switch users, built with Electron and React.

## Description

Switcheroo is a desktop application that helps you manage your display inputs when using a Nintendo Switch. It provides an easy way to switch between different display inputs, making it convenient to use your monitor with both your computer and Nintendo Switch.

## Features

- Easy display input switching
- Cross-platform support (Windows, macOS, Linux)
- Modern user interface built with React and Ant Design
- Automatic updates support
- DDC/CI monitor control

## Installation

You can download the latest version of Switcheroo from the [releases page](https://github.com/JaroslawPokropinski/Switcheroo/releases).

Available formats:

- Windows: `.exe` installer
- macOS: `.dmg` file
- Linux: `.AppImage`

## Development

### Prerequisites

- Node.js >=14.x
- npm >=7.x

### Setup

1. Clone the repository:

```bash
git clone https://github.com/JaroslawPokropinski/Switcheroo.git
cd Switcheroo
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

### Available Scripts

- `npm start` - Start the app in development mode
- `npm run build` - Build the app for production
- `npm run package` - Package the app for distribution
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## Building

To build the application for distribution:

```bash
npm run package
```

This will create distributables for your current platform in the `release/build` directory.

## Tech Stack

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Ant Design](https://ant.design/) - UI components
- [Webpack](https://webpack.js.org/) - Module bundler
- [Jest](https://jestjs.io/) - Testing framework

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
