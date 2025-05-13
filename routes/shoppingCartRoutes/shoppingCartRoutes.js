const express = require("express");
const router = express.Router();
const productController = require("../../controllers/shoppingCart/shoppingCartController");
const { userAuthenticate } = require("../../middlewares/userAuthenticate");

router.post("/", userAuthenticate, productController.createCartItem);
router.get("/", userAuthenticate, productController.getAllCartItems);
router.get("/:id", userAuthenticate, productController.getCartItemById);
router.put("/:id", userAuthenticate, productController.updateCartItem);
router.delete("/:id", userAuthenticate, productController.deleteCartItem);
router.post(
  "/delete-multiple",
  userAuthenticate,
  productController.deleteMultipleCartItems
);

module.exports = router;
