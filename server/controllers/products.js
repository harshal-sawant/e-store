const Product = require("../models/product");

const getAllProducts = async (req, res) => {
  const { search, category, sort, numericFilter, limit } = req.query;
  const queryObject = {};
  if (search) {
    queryObject.title = { $regex: search, $options: "i" }; // 'i' makes it case-insensitive
  }
  if (category) {
    queryObject.category = category;
  }
  // range get products between 150, 190 => ?numericFilter= 150, 190, when 670 it's 670+
  if (numericFilter) {
    let newvar = numericFilter.split(",");
    if (+newvar[1] === 670) {
      queryObject["price"] = { $gte: +newvar[0] };
    } else {
      queryObject["price"] = { $gte: +newvar[0], $lte: +newvar[1] };
    }
  }
  let result = Product.find(queryObject).sort(sort);
  // Apply the limit if provided
  if (limit) {
    result = result.limit(parseInt(limit, 10));
  }
  const products = await result;
  res.status(200).json({ success: true, data: products });
};

const getOneProduct = async (req, res) => {
  let { id: productID } = req.params;
  if (!productID) {
    res.status(404).json({ msg: `Product ID not found.` });
  }
  const product = await Product.findOne({ _id: productID });
  res.status(200).json({ success: true, data: product });
};
const createProduct = async (req, res) => {
  try {
    if (req.files) {
      let path = "";
      req.files.forEach((files, index, arr) => {
        path = path + files.path + ",";
      });
      path = path.substring(0, path.lastIndexOf(","));
      req.body.images = path.split(",");
    }
    let product = await Product.create(req.body);
    if (!product) {
      res.status(404).json({ msg: `enter valid product` });
    }
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.name === "ValidationError") {
      // Mongoose validation error
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(422).json({ errors });
    }
    // Other types of errors
    console.error("Error saving product:", err);
    res.status(500).json({ error: "Error saving product" });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id: productID } = req.params;
    if (req.files) {
      let path = "";
      req.files.forEach((files, index, arr) => {
        path = path + files.path + ",";
      });
      path = path.substring(0, path.lastIndexOf(","));
      req.body.images = path.split(",");
    }
    let product = await Product.findByIdAndUpdate(productID, req.body);
    res.status(200).json({ success: true, msg: `(${product.name}) Updated` });
  } catch (error) {
    if (err.name === "ValidationError") {
      // Mongoose validation error
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(422).json({ errors });
    }
    // Other types of errors
    res.status(500).json({ error: "Error saving product" });
  }
};
const deleteProduct = async (req, res) => {
  let { id: productID } = req.params;
  let product = await Product.findByIdAndDelete(productID);
  res.status(200).json({ success: true, msg: `(${product.title}) Deleted!` });
};

module.exports = {
  getAllProducts,
  getOneProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
