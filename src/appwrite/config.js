import { Client, Databases, Storage, Query, ID } from "appwrite";
import conf from "../util/conf";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.APPWRITE_URL)
      .setEndpoint(conf.APPWRITE_PROJECT_ID);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      return await this.databases.createDocument(
        conf.APPWRITE_DATABASE_ID,
        conf.APPWRITE_COLLECTION_ID,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userId,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      return await this.databases.updateDocument(
        conf.APPWRITE_DATABASE_ID,
        conf.APPWRITE_COLLECTION_ID,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.APPWRITE_DATABASE_ID,
        conf.APPWRITE_COLLECTION_ID,
        slug
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        conf.APPWRITE_DATABASE_ID,
        conf.APPWRITE_COLLECTION_ID,
        slug
      );
    } catch (error) {
      throw error;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      await this.databases.listDocuments(
        conf.APPWRITE_DATABASE_ID,
        conf.APPWRITE_COLLECTION_ID,
        queries
      );
    } catch (error) {
      throw error;
    }
  }

  //file upload

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.APPWRITE_BUCKET_ID, fileId);
    } catch (error) {
      throw error;
    }
  }

  getFilePreview(fileId){
    return this.bucket.getFilePreview(conf.APPWRITE_BUCKET_ID,fileId)
  }

}

const service = new Service();
export default service;
