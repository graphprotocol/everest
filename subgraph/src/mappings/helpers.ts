import { ByteArray, BigInt, Bytes, JSONValue, ipfs, json } from '@graphprotocol/graph-ts'
import { Category, Everest } from '../types/schema'

// Helper adding 0x12 and 0x20 to make the proper ipfs hash
// the returned bytes32 is so [0,31]
export function addQm(a: ByteArray): ByteArray {
  let out = new Uint8Array(34)
  out[0] = 0x12
  out[1] = 0x20
  for (let i = 0; i < 32; i++) {
    out[i + 2] = a[i]
  }
  return out as ByteArray
}

// Returns a list of all category IDs and all of its parents, and its grandparents, etc.
export function recursiveCategories(
  category: Category,
  categoryIDs: Array<string>,
  projectID: string,
): Array<string> {
  if (category.parentCategory != null) {
    let parentCategory = Category.load(category.parentCategory) as Category
    if (!parentCategory.projects.includes(projectID)) {
      let parentCategoryProjects = parentCategory.projects
      parentCategoryProjects.push(projectID)
      parentCategory.projects = parentCategoryProjects
      parentCategory.projectCount = parentCategory.projects.length
      parentCategory.save()
    }
    // The returned list could have parent categories twice, so we must de-dep
    if (!categoryIDs.includes(category.parentCategory)) {
      categoryIDs.push(category.parentCategory)
    }
    return recursiveCategories(parentCategory, categoryIDs, projectID)
  } else {
    return categoryIDs
  }
}

// Since everest was updated, we use this function to return us the address
// relevant to the block number of the event
export function getEverestAddress(blockNumber: BigInt): string {
  if (blockNumber.gt(BigInt.fromI32(7735064))) {
    return '0x275DB6f75F53D8E94c34797D84B1c1896043c6a3'
  } else {
    return '0xeCe52D2bA232fde90f56AAe6aBBeaCb17ef2b546'
  }
}

export function spliceProjectFromCategories(
  projCategories: Array<string>,
  projectID: string,
): void {
  // Remove the project from its old categories
  for (let i = 0; i < projCategories.length; i++) {
    let category = Category.load(projCategories[i])
    // Filter out the project, and return the array without it
    let projectIsInCategory = category.projects.indexOf(projectID)
    if (projectIsInCategory != -1) {
      let categoryProjects = category.projects
      categoryProjects.splice(projectIsInCategory, 1)
      category.projects = categoryProjects
      category.projectCount = category.projects.length
      category.save()
    }
  }
}

export function getVoteChoice(voteChoice: number): string {
  let value = 'Null'
  if (voteChoice == 1) {
    value = 'Yes'
  } else if (voteChoice == 2) {
    value = 'No'
  }
  return value
}

export function parseCategoryDetails(ipfsHash: Bytes, timestamp: BigInt): void {
  let hexHash = addQm(ipfsHash) as Bytes
  let base58Hash = hexHash.toBase58()
  let ipfsData = ipfs.cat(base58Hash)

  if (ipfsData != null) {
    let categories = json.fromBytes(ipfsData as Bytes).toArray()
    if (categories != null) {
      for (let i = 0; i < categories.length; i++) {
        createCategory(categories[i], timestamp)
      }
    }
  }
}

function createCategory(categoryJSON: JSONValue, timestamp: BigInt): void {
  let categoryData = categoryJSON.toObject()
  let everest = Everest.load('1')
  everest.categoriesCount = everest.categoriesCount + 1

  let id: string = categoryData.get('id').isNull()
    ? null
    : categoryData.get('id').toString()

  let category = Category.load(id)
  if (category == null) {
    category = new Category(id)
    category.createdAt = timestamp.toI32()
    category.projectCount = 0
    category.projects = []
  }
  category.name = categoryData.get('name').isNull()
    ? null
    : categoryData.get('name').toString()
  category.description = categoryData.get('description').isNull()
    ? null
    : categoryData.get('description').toString()
  category.slug = categoryData.get('slug').isNull()
    ? null
    : categoryData.get('slug').toString()
  category.imageHash = categoryData.get('imageHash').isNull()
    ? null
    : categoryData.get('imageHash').toString()
  category.imageUrl = categoryData.get('imageUrl').isNull()
    ? null
    : categoryData.get('imageUrl').toString()
  category.parentCategory = categoryData.get('parent').isNull()
    ? null
    : categoryData.get('parent').toString()
  category.save()
  everest.save()
}
