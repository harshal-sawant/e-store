const express = require("express");
const router = express.Router();
const {
  getCart,
  updateCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/user-lists");
const {
  getWishlist,
  updateWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  clearWishlist,
} = require("../controllers/wishlist");
const upload = require("../middleware/upload");

router.route("/:userId");
router.route("/:userId/cart").get(getCart).put(updateCart);
router.route("/:userId/wishlist").get(getWishlist).put(updateWishlist);
router.route("/:userId/cart/:productId").post(addToCart).delete(removeFromCart);
router
  .route("/:userId/wishlist/:productId")
  .post(addToWishlist)
  .delete(removeFromWishlist)
  .patch(updateWishlistItem);
router.route("/:userId/cart/clear").delete(clearCart);
router.route("/:userId/wishlist/clear").delete(clearWishlist);

module.exports = router;
