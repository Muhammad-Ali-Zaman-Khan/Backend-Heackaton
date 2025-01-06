import express from "express";
import { addProduct, getAllProducts, getSingleProduct, deleteProduct, editProduct , uploadImage } from "../controllers/product.controller.js"; 
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/", addProduct);
router.get("/getallproduct", getAllProducts);
router.get("/:id", getSingleProduct);
router.delete("/:id", deleteProduct);
router.put("/:id", editProduct);
router.post("/uploadimage" , upload.single("image") , uploadImage);

export default router;
