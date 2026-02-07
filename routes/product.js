const express = require("express");

const productController = require("../controllers/product");

const { verify, verifyAdmin, /*isLoggedIn*/ } = require("../auth");

const router = express.Router();

router.post('/', verify, verifyAdmin, productController.createProduct);

router.get('/all', verify, productController.getAllProduct);

router.get('/active', verify, productController.getAllActive);

router.get('/:productId', verify, productController.getProduct);

router.patch("/:productId", verify, verifyAdmin, productController.updateProductInfo);

router.patch("/activate/:productId/", verify, verifyAdmin, productController.activateProduct);

router.patch("/archive/:productId/", verify, verifyAdmin, productController.archiveProduct);

router.post("/searchByName",productController.searchProductsByName);

router.post("/searchByPrice",productController.searchProductsByPriceRange);

module.exports = router;