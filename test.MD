### How to test locally

1. Run `npm run watch` to watch for changes and build the project
2. Open `test/index.html` in your browser
3. Ensure that the script points to `dist/bundle.js` in the `test` folder index.html file
4. Add `?logtohtml=true` to the URL to test the log window
5. Enjoy!


### Publish to npm

1. Run `npm run build` to build the project
2. Add version number to `package.json` and `changelog.MD`
3. Run `npm publish`
4. add `git add .` and `git commit -m "version number"` to commit changes
5. Run `git push` to push changes to remote
6. Run `git tag -a "version number" -m "version number"` to create a tag


