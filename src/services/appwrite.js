import { Client, Account, Databases } from 'appwrite'

const client = new Client()

client
  .setEndpoint('http://localhost/v1') // Your Appwrite Endpoint
  .setProject('temp-offline-mode') // Temporary - will be replaced when we set up Appwrite project

export const account = new Account(client)
export const databases = new Databases(client)

export { client } 