

git pull

rm -rf dist
npm run bundle

git add .
git commit -m "build"
git tag -a -m "First attempt" v1.7
git push --follow-tags