## Explaination of how the categories.json file is created
- Categories are named based on the category name and any parent categories
- This makes a unique name, which we use for the slug, and we also use to refer
  to all other files that store data
  - Since we have data coming from many places, it was built like this
- IDs need to be permanent. So going forward, everything should be added
  to the end of the files, and then created