import mongoose from "mongoose";
import Products from "../models/product.model.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// CLOUDINARY CONFIG

cloudinary.config({ 
  cloud_name: 'dipbzyc4m', 
  api_key: '435397383731781', 
  api_secret: 'sgcmnEftZHg3eRuJarN421EJrbQ',
});

// Upload an image Cloudinary Function

const uploadImageToCloudinary = async (localpath) => {
  try {
      const uploadResult = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto"
      });
      
      fs.unlinkSync(localpath);
      return uploadResult.url;
  } catch (error) {
      console.log(error);
      fs.unlinkSync(localpath);
      return null;
  };

};


//Add Product

const addProduct = async (req, res) => {
  const { title, description, price, user } = req.body;

  if (!title || !description || !price || !user) {
    return res.status(400).json({
      message: "Title, description, price, and user are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({
      message: "Invalid user ID format",
    });
  }

  try {
    const product = await Products.create({
      title,
      description,
      price,
      user, 
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while adding the product",
      error: error.message,
    });
  }
};


// get all products
const getAllProducts = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
  
    const skip = (page - 1) * limit;
  
    const products = await Products.find({}).skip(skip).limit(limit);
    res.status(200).json({
        products,
        });
  };
  


// get single product
const getSingleProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Not valid Id" });
  }

  const product = await Products.findById(id);
  if (!product) {
    res.status(404).json({
      message: "no product found",
    });
  }
  res.status(200).json(product);
};

// delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Not valid Id" });
  }

  const product = await Products.findOneAndDelete({ _id: id });

  res.status(200).json({
    message: "product deleted successfully",
    product,
  });
};


// edit product

const editProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Not valid Id" });
  }

  const product = Products.findOneAndUpdate(
    {
      _id: id,
    },
    { ...req.body }
  );

  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
};



// UPLOAD IMAGE MAIN FUNCTION

const uploadImage = async (req , res) => {
  if(!req.file) 
      return res.status(400).json({
  message: "No Image File Uploaded"
  });

  try {

      const uploadResult = await uploadImageToCloudinary(req.file.path);

      if(!uploadResult)
          return res.status(500).json({
      message: "No image Found while uploading"
      });

      res.json({
         message: "Image Uploaded Successfully" ,
         url: uploadResult,
      });
      
  } catch (error) {
      console.log(error);
      res.status(500).json({
          message: "No image Found while uploading"
      });
  };

};


export { addProduct, getAllProducts, getSingleProduct, deleteProduct, editProduct , uploadImage };