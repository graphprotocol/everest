import { ByteArray, BigInt } from '@graphprotocol/graph-ts'
import { Category, Project, Test } from '../types/schema'

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
