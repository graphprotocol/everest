import {
  json,
  ipfs,
  Bytes,
  JSONValue,
  BigInt,
  log,
  JSONValueKind,
} from '@graphprotocol/graph-ts'

import {
  DIDOwnerChanged,
  DIDDelegateChanged,
  DIDAttributeChanged,
} from '../types/EthereumDIDRegistry/EthereumDIDRegistry'

import { Project, Category, User } from '../types/schema'
import { addQm } from './helpers'

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
    delegates.push(event.params.delegate)
    project.delegates = delegates
    project.updatedAt = event.block.timestamp.toI32()
    project.save()
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
*/
export function handleDIDAttributeChanged(event: DIDAttributeChanged): void {
  let id = event.params.identity.toHexString()
  let project = Project.load(id)
  if (project != null) {
    if (
      event.params.name.toHexString() ==
      '0x50726f6a65637444617461000000000000000000000000000000000000000000'
    ) {
      // TODO - ponential for crashing? Because value is not forced to be 32 bytes. This is an
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
            project.isRepresentative = data.get('isRepresentative').toBool()
          }
        }

        let categories = data.get('categories')
        if (categories != null) {
          if (categories.kind == JSONValueKind.ARRAY) {
            let categoriesArray = categories.toArray()

            // First we MUST check if it is null and if so, make it an empty array
            let projCategories = project.categories
            if (projCategories == null) {
              projCategories = []
            }

            // Push all of the values into the empty array
            for (let i = 0; i < categoriesArray.length; i++) {
              if (categoriesArray[i].kind == JSONValueKind.STRING) {
                projCategories.push(categoriesArray[i].toString())
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
