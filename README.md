# Dometik Chrome Extension

![GitHub manifest version](https://img.shields.io/github/manifest-json/v/marierigal/dometik-chrome-extension) ![GitHub](https://img.shields.io/github/license/marierigal/dometik-chrome-extension)

**Dometik** is a Chrome extension that add new tools to the devtools to check if some elements on a page have a specific attribute.

## What's included

- A new **Dometik panel** where you can check elements data attribute over the entire page and export a csv report.

- A new **Dometik sidebar panel** where you can check the data attribute for the current inspected element.

## Installation

1. Clone/download the github repository.
2. In Chrome application, navigate to `chrome://extensions`.
3. Enable `Developer mode` on the top right corner.
4. Click on `Load the unpackaged extension` and select the `dometik-chrome-extension` folder.

The extension is ready to be used, enjoy it !

## Usage

Browse to the page you want to check, then open the chrome devtools.
Click on the `Dometik` tab, then click on the `Check page` button.

- All elements that have the defined html attribute (cf: Configuration) are bordered in green.
- All elements that should have the html attribute and are not, are bordered in red.

Now, you can see all elements attribute details in the `Dometik` panel.
Click on an element in the table to inspect it.

## Configuration

To acces the extension configuration, click on the extension icon (on the top right window) and click on `Options`.

> These options can help you refine the checked elements.

### container

default: `body`

The css selector of the element that contains all the elements that need to be checked.

### elements

default: `a, button, form, [data-lf-tracking]`

The list of css selectors elements that need to be checked.

### attribute

default: `data-lf-tracking`

The html attribute that contains the data you want to check.

### jsonKeys

default: `bind, action, category, label`

If the content of the attribute should be a JSON object, define here the list of properties it should have.

## TODO

- [ ] Script to clear classes and attributes added by the content script
- [ ] Code refactoring
- [ ] Improve UX/UI

## License

This project is [MIT licensed](LICENSE).
