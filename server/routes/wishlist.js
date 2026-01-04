const express = require("express");
const router = express.Router();

const {
  getWishlist,
  updateWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  clearWishlist,
} = require("../controllers/wishlist");

router
  .route("/:userId/wishlist")
  .get(getWishlist)
  .put(updateWishlist)
  .post(addToWishlist);

router.route("/:userId/wishlist/clear").delete(clearWishlist);

router
  .route("/:userId/wishlist/:productId")
  .delete(removeFromWishlist)
  .put(updateWishlistItem);

module.exports = router;
