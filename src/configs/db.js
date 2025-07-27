import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";
import { Company } from "../models/Company.js";

export const connectToMongoDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      { retryWrites: true, w: "majority", appName: "i11labs" }
    );
      await Company.syncIndexes();
    console.log(
      `MongoDB connected. DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB Connection Failed ${error}`);
    process.exit(1);
  }
};
