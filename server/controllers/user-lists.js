const UserLists = require("../models/user-lists");

const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    let userList = await UserLists.findById(userId).populate("cart.product");

    if (!userList) {
      // Return empty array if user list doesn't exist yet
      return res.status(200).json([]);
    }

    // Return populated products array
    const cartProducts = userList.cart.map((item) => {
      const product = item.product.toObject
        ? item.product.toObject()
        : item.product;
      product.unit = item.quantity;
      return product;
    });

    res.status(200).json(cartProducts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const updateCart = async (req, res) => {
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
      const cartItems = products.map((product) => ({
        product: product._id,
        quantity: product.unit || 1,
      }));

      userList = await UserLists.create({
        _id: userId,
        cart: cartItems,
      });
    } else {
      // Update existing cart
      userList.cart = products.map((product) => ({
        product: product._id,
        quantity: product.unit || 1,
      }));
      await userList.save();
    }

    // Populate and return updated cart
    userList = await UserLists.findById(userId).populate("cart.product");

    const cartProducts = userList.cart.map((item) => {
      const productObj = item.product.toObject
        ? item.product.toObject()
        : { ...item.product };
      productObj.unit = item.quantity;
      return productObj;
    });

    res.status(200).json(cartProducts);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ msg: error.message });
  }
};

const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    let userList = await UserLists.findById(userId);

    if (!userList) {
      userList = await UserLists.create({
        _id: userId,
        cart: [{ product: productId, quantity: quantity || 1 }],
      });
    } else {
      const cartItem = userList.cart.find(
        (item) => item.product.toString() === productId
      );
      if (cartItem) {
        // Update quantity if item already in cart
        cartItem.quantity += quantity || 1;
      } else {
        userList.cart.push({ product: productId, quantity: quantity || 1 });
      }
      await userList.save();
    }

    await userList.populate("cart.product");

    const cartProducts = userList.cart.map((item) => {
      const product = item.product.toObject
        ? item.product.toObject()
        : item.product;
      product.unit = item.quantity;
      return product;
    });

    res.status(201).json(cartProducts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    let userList = await UserLists.findById(userId);

    if (!userList) {
      return res
        .status(404)
        .json({ msg: `No user list found for user ${userId}` });
    }

    userList.cart = userList.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await userList.save();

    userList = await userList.populate("cart.product");

    const cartProducts = userList.cart.map((item) => {
      const product = item.product.toObject
        ? item.product.toObject()
        : item.product;
      product.unit = item.quantity;
      return product;
    });

    res.status(200).json(cartProducts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const userList = await UserLists.findById(userId);

    if (!userList) {
      return res
        .status(404)
        .json({ msg: `No user list found for user ${userId}` });
    }

    userList.cart = [];
    await userList.save();

    res.status(200).json({
      success: true,
      msg: "Cart cleared successfully",
      cart: [],
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getCart,
  updateCart,
  addToCart,
  removeFromCart,
  clearCart,
};
