const UserLists = require("../models/user-lists");

const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    let userList = await UserLists.findById(userId).populate(
      "wishlist.product"
    );

    if (!userList) {
      // Return empty array if user list doesn't exist yet
      return res.status(200).json([]);
    }

    // Return populated products array
    const wishlistProducts = userList.wishlist.map((item) => {
      const product = item.product.toObject
        ? item.product.toObject()
        : item.product;
      product.unit = item.quantity;
      return product;
    });

    res.status(200).json(wishlistProducts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const updateWishlist = async (req, res) => {
  const { userId } = req.params;
  const products = req.body; // Array of products from frontend

  try {
    // Validate input
    if (!Array.isArray(products)) {
      return res.status(400).json({ msg: "Products must be an array" });
    }

    let userList = await UserLists.findById(userId);

    if (!userList) {
      // Create new user list if doesn't exist
      const wishlistItems = products.map((product) => ({
        product: product._id,
        quantity: product.unit || 1,
      }));

      userList = await UserLists.create({
        _id: userId,
        wishlist: wishlistItems,
      });
    } else {
      // Update existing wishlist
      userList.wishlist = products.map((product) => ({
        product: product._id,
        quantity: product.unit || 1,
      }));
      await userList.save();
    }

    // Populate and return updated wishlist
    userList = await UserLists.findById(userId).populate("wishlist.product");

    const wishlistProducts = userList.wishlist.map((item) => {
      const productObj = item.product.toObject
        ? item.product.toObject()
        : { ...item.product };
      productObj.unit = item.quantity;
      return productObj;
    });

    res.status(200).json(wishlistProducts);
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ msg: error.message });
  }
};

const addToWishlist = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  let userList = await UserLists.findById(userId);

  if (!userList) {
    userList = await UserLists.create({
      _id: userId,
      wishlist: [{ product: productId, quantity: quantity || 1 }],
    });
  } else {
    const wishlistItem = userList.wishlist.find(
      (item) => item.product.toString() === productId
    );
    if (wishlistItem) {
      // If item already in wishlist, you might want to update quantity or just do nothing
      await userList.populate("wishlist.product");
      return res.status(200).json({
        msg: "Product already in wishlist",
        wishlist: userList.wishlist,
      });
    }
    userList.wishlist.push({ product: productId, quantity: quantity || 1 });
    await userList.save();
  }
  await userList.populate("wishlist.product");
  res.status(201).json({ wishlist: userList.wishlist });
};

const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.params;
  let userList = await UserLists.findById(userId);

  if (!userList) {
    return res
      .status(404)
      .json({ msg: `No user list found for user ${userId}` });
  }

  userList.wishlist = userList.wishlist.filter(
    (item) => item.product.toString() !== productId
  );
  await userList.save();

  userList = await userList.populate("wishlist.product");

  res.status(200).json({ wishlist: userList.wishlist });
};

const updateWishlistItem = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res
      .status(400)
      .json({ msg: "Please provide a valid quantity (must be 1 or greater)." });
  }

  const userList = await UserLists.findOneAndUpdate(
    { _id: userId, "wishlist.product": productId },
    { $set: { "wishlist.$.quantity": quantity } },
    { new: true }
  ).populate("wishlist.product");

  if (!userList) {
    return res.status(404).json({
      msg: `Item with product ID ${productId} not found in wishlist for user ${userId}.`,
    });
  }

  res.status(200).json({ wishlist: userList.wishlist });
};

const clearWishlist = async (req, res) => {
  const { userId } = req.params;

  const userList = await UserLists.findById(userId);

  if (!userList) {
    return res
      .status(404)
      .json({ msg: `No user list found for user ${userId}` });
  }

  userList.wishlist = [];
  await userList.save();

  res.status(200).json({
    success: true,
    msg: "Wishlist cleared successfully",
    wishlist: [],
  });
};

module.exports = {
  getWishlist,
  updateWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  clearWishlist,
};
