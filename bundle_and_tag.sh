npm run bundle

git add .
git commit -m "build"
git tag -d v1.0
git tag -a -m "First attempt" v1.0
git push --follow-tags