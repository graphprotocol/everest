## Explaination of how the categories.json file is created
- Categories are named based on the category name and any parent categories
- This makes a unique name, which we use for the slug, and we also use to refer
  to all other files that store data
  - Since we have data coming from many places, it was built like this
- IDs need to be permanent. So going forward, everything should be added
  to the end of the files, and then created

## Updating categories
- Update the raw category data files
- Run the categories script. It should update categories.json. It also pins that file to ipfs
  so that it will exist on the hosted service. make sure `ipfs daemon` is running
- Do not run the ids script. This is permanent. It should only be run to add new categories
  with new ids
- Then run the script to update categories on the blockchain, which is in `contracts/scripts`.
  The script should work automatically with the newly updated ipfs hash
- Best to test on ropsten first