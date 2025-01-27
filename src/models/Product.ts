import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
  name:string;
  description:string;
  price:string;
  productId:string;
}

const productSchema = new Schema<Product>({
 name:{
  type:String,
  required:true
 },
 description:{
  type:String,
  required:true
 },
 price:{
  type:String,
  required:true
 },
 productId:{
  type:String,
  required:true,
  unique:true
 }
});

const ProductModel = mongoose.model<Product>("Product", productSchema);

export default ProductModel;