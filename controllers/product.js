const bcrypt = require('bcrypt');

const Product = require("../models/Product");

const auth = require("../auth");

module.exports.createProduct = (req, res) => {
	try { 

		let newProduct = new Product({
			name : req.body.name,
			description : req.body.description,
			price : req.body.price
		});

		Product.findOne({ name: req.body.name })
			.then(existingProduct => {

				if(existingProduct){
					
					return res.status(409).send({ error: "Product already exists"});
				}

				return newProduct.save()
						.then(savedProduct => res.status(201).send({ savedProduct }))
						
						.catch(err => {

							console.error("Error in saving the product:", err);

							return res.status(500).send({ error: "Failed to save the product"})

						});

			}).catch(err => {

				console.error("Error in finding product: ", err);

				return res.status(500).send({ message: "Error finding the product" });

			});

	} catch(err) {

		 console.error("Error in finding product: ", err);

		 return res.status(500).send({ message: "Error in getting the variables" });

	}
};

module.exports.getAllProduct = (req, res) => {

	return Product.find({})
	.then(product => {

		if(product.length > 0){
		    return res.status(200).send({ product });
		}
		else{
			
		    return res.status(200).send({ message: 'No product found.' });
		}

	})
	.catch(err => {

		console.error("Error in finding all product", err);

		return res.status(500).send({ error: "Error finding product"});

	});

};

module.exports.getAllActive = (req, res) => {

	Product.find({ isActive: true })
	.then(product => {
		
		if (product.length > 0){
		    
		    return res.status(200).send({ product });
		}

		else {

		    return res.status(200).send({message: "There are no product at the moment."})
		}
	})
	.catch(err => {

		console.error("Error in finding active product: ", err);
		return res.status(500).send({ error: "Error in finding active product"})

	});

};

module.exports.getProduct = (req, res) => {
	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {
		if (!product) {
			return res.status(404).send({ error: 'Product not found' });
		}
		return res.status(200).send({ product });
	})
	.catch(err => {
		console.error("Error in fetching the product: ", err)
		return res.status(500).send({ error: 'Failed to fetch product' });
	})
};

module.exports.updateProductInfo = (req, res) => {
  const productId = req.params.productId;
  const { name, description, price } = req.body;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      // Update product fields if provided in the request body
      product.name = name;
      product.description = description;
      product.price = price;

      // Save the updated product
      return product.save();
    })
    .then(updatedProduct => {
      res.status(200).send({ message: "Product updated successfully", product: updatedProduct });
    })
    .catch(error => {
      console.error("Error updating product:", error);
      res.status(500).send({ message: "Internal server error" });
    });
};


module.exports.activateProduct = (req, res) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      product.isActive = true;
      return product.save();
    })
    .then(updatedProduct => {
      res.status(200).send({ message: "Product activated successfully", product: updatedProduct });
    })
    .catch(error => {
      console.error("Error activating product:", error);
      res.status(500).send({ message: "Internal server error" });
    });
};

module.exports.archiveProduct = (req, res) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      product.isActive = false;
      return product.save();
    })
    .then(updatedProduct => {
      res.status(200).send({ message: "Product activated successfully", product: updatedProduct });
    })
    .catch(error => {
      console.error("Error activating product:", error);
      res.status(500).send({ message: "Internal server error" });
    });
};

module.exports.searchProductsByName = async (req, res) => {
    try {
  
        console.log(req.body);
  
      const { name } = req.body;
  
      const products = await Product.find({
        name: { $regex: name, $options: "i" }
      });
  
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  module.exports.searchProductsByPriceRange = async (req, res) => {
    const { minPrice, maxPrice } = req.body;
  
    try {
      const products = await Product.find({
        price: { 
          $gte: minPrice || 0, 
          $lte: maxPrice || Number.MAX_VALUE 
        }
      });

      if (products.length === 0) {
      res.status(404).json({ message: "No products are within the price range" });
    } else {
      res.status(200).json(products);
    }

    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };