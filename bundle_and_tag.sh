npm run bundle

git add .
git commit -m "build"
git tag -a -m "First attempt" v1.8
git push --follow-tags