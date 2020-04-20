import { json, ipfs, Bytes, JSONValueKind, log } from '@graphprotocol/graph-ts'

import {
  DIDOwnerChanged,
  DIDDelegateChanged,
  DIDAttributeChanged,
} from '../types/EthereumDIDRegistry/EthereumDIDRegistry'

import { Project, User, Category, Everest } from '../types/schema'
import { addQm, recursiveCategories, spliceProjectFromCategories } from './helpers'

// Projects are created in everest.ts::handleApplicationMade
// If a project is null, it was not added to everest and we want to ignore it
// This allows the subgraph to only create data on Everest identities in
// the ethereumDIDRegistry, and ignore any other identity that has ever been created

// event.params.previousChange is not in use. The subgraph makes this kind of a useless value
export function handleDIDOwnerChanged(event: DIDOwnerChanged): void {
  let id = event.params.identity.toHexString()
  let project = Project.load(id)
  if (project != null) {
    project.owner = event.params.owner.toHexString() // TODO owner not getting set
    project.updatedAt = event.block.timestamp.toI32()
    project.save()
  }
  let user = User.load(event.params.owner.toHexString())
  if (user == null) {
    user = new User(event.params.owner.toHexString())
    user.createdAt = event.block.timestamp.toI32()
    user.save()
  }
}

// event.params.previousChange is not in use. The subgraph makes this kind of a useless value
// event.params.validTo is not in use. The subgraph makes this kind of a useless value
// event.params.delegateType is always keccak256(bytes("everest"))
export function handleDIDDelegateChanged(event: DIDDelegateChanged): void {
  let id = event.params.identity.toHexString()
  let project = Project.load(id)
  if (project != null) {
    let delegates = project.delegates
    if (delegates == null) {
      delegates = []
    }
    delegates.push(event.params.delegate.toHexString())
    project.delegates = delegates
    project.updatedAt = event.block.timestamp.toI32()
    project.save()
  }

  let user = User.load(event.params.delegate.toHexString())
  if (user == null) {
    user = new User(event.params.delegate.toHexString())
    user.createdAt = event.block.timestamp.toI32()
    user.save()
  }
}

/*
  DIDAttributeChanged 
    - is just an event emitted (no contract storage). So whenever there is a new
    event emitted, the subgraph just overwrites the previous data

  event.params.previousChange 
    - is not in use. The subgraph makes this kind of a useless value

  event.params.name
    - can be customized. To start, the everest front end will use :
    bytes32("projectInfo") = 0x70726f6a656374496e666f000000000000000000000000000000000000000000
    - note there are 42 zeros at the end
    - In the future, if we want different data to be added, we can have a different name, and handle
    that differently

  event.params.validTo
    - Everest front end will just pass a large value, such as 100 years, since we are not implementing
    custom features here now, but he have to pass a value nonetheless. The subgraph does not handle
    this value at all, it only considers the most recent DIDAttribute as the correct one

  Note - someone could not upload any data here (blank IPFS file, or never calling
  DIDAttributeChanged). But this is okay, because that project should get challenged  
*/
export function handleDIDAttributeChanged(event: DIDAttributeChanged): void {
  let id = event.params.identity.toHexString()
  let project = Project.load(id)
  if (project != null) {
    if (
      event.params.name.toHexString() ==
      '0x50726f6a65637444617461000000000000000000000000000000000000000000'
    ) {
      // Potnential for crashing? Because value is not forced to be 32 bytes. This is an
      // edge case because it has to be an identity, then it has to be called outside of the
      // everest front end
      let hexHash = addQm(event.params.value) as Bytes
      let base58Hash = hexHash.toBase58()
      project.ipfsHash = base58Hash

      let ipfsData = ipfs.cat(base58Hash)
      if (ipfsData != null) {
        let data = json.fromBytes(ipfsData as Bytes).toObject()
        project.name = data.get('name').isNull() ? null : data.get('name').toString()
        project.description = data.get('description').isNull()
          ? null
          : data.get('description').toString()
        project.website = data.get('website').isNull()
          ? null
          : data.get('website').toString()
        project.twitter = data.get('twitter').isNull()
          ? null
          : data.get('twitter').toString()
        project.github = data.get('github').isNull()
          ? null
          : data.get('github').toString()
        project.avatar = data.get('avatar').isNull()
          ? null
          : data.get('avatar').toString()
        project.image = data.get('image').isNull() ? null : data.get('image').toString()

        if (!data.get('isRepresentative').isNull()) {
          if (data.get('isRepresentative').kind == JSONValueKind.BOOL) {
            let newRepStatus = data.get('isRepresentative').toBool()
            let everest = Everest.load('1')
            // Proj was false
            if (project.isRepresentative == false) {
              // if true need to add to everest
              if (newRepStatus) {
                everest.claimedProjects = everest.claimedProjects + 1
                everest.save()
              }
              // Else it is true. We have to count down if they revert the isRep
            } else {
              if (!newRepStatus) {
                everest.claimedProjects = everest.claimedProjects - 1
                everest.save()
              }
            }
            project.isRepresentative = newRepStatus
          }
        }

        let categories = data.get('categories')
        if (categories != null) {
          if (categories.kind == JSONValueKind.ARRAY) {
            let categoriesArray = categories.toArray()

            // Load the projects previous categories
            let projCategories = project.categories //as Array<string>
            spliceProjectFromCategories(projCategories, project.id)

            // We reset the project categories, because the IPFS file will always have a new values
            projCategories = []

            // Start handling the new categories added to the project
            // Push all of the values into the empty array, including parent IDs
            for (let i = 0; i < categoriesArray.length; i++) {
              let categoryObj = categoriesArray[i].toObject()
              let categoryID = categoryObj.get('id').toString()
              let category = Category.load(categoryID) as Category
              if (!category.projects.includes(project.id)) {
                let categoryProjects = category.projects
                categoryProjects.push(project.id)
                category.projects = categoryProjects
                category.projectCount = category.projects.length
                category.save()
              }

              let categoryIDsWithParents = recursiveCategories(
                category,
                [categoryID],
                project.id,
              )
              // Push each element of the array into the projCategories array
              // note - projCategories.push(...categoryIDsWithParents) won't work in assembly script
              for (let i = 0; i < categoryIDsWithParents.length; i++) {
                projCategories.push(categoryIDsWithParents[i])
              }
            }
            // Now deliberately set to the array
            project.categories = projCategories
          }
        }
      }
      project.updatedAt = event.block.timestamp.toI32()
      project.save()
    }
  }
}
