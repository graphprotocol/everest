import { ByteArray } from '@graphprotocol/graph-ts'
import { Category } from '../types/schema'

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
      parentCategory.projectCount = category.projects.length
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
