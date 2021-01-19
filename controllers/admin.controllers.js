// Import our Product model
const Product = require("../models/Product");

// Naming convention by MDN
// (1) products_get
// (2) add_Product_get
// (3) add_product_post
// (4) edit_product_get
// (5) edit_product_post
// (6) delete_product_post

//==========================================
// Admin controllers
// (1)
const products_get = async (req, res, next) => {
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    } else {
        successMessage = null;
    }
    await Product
            .find({ userId: req.user._id })
            .sort({ createdAt: -1 })// Sort them descendingly
            .then(products => {
                res.render('admin/products', { 
                    title: 'Admin products',
                    path: '/admin/products',
                    prods: products,
                    successMessage
                })
            })
            .catch(err => res.json(err.message));
};

// (2)
const add_Product_get = (req, res, next) => {
    res.render('admin/add-product', { 
        title: 'Add Product',
        path: '/admin/add-product',
        isEditing: false
    });
};

// (3)
const add_product_post = async (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;
    let product = new Product( {
        title,
        imageUrl,
        price,
        description,
        userId: req.user._id
    });
    await product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err.message)
        })
};

// (4)
const edit_product_get = async (req, res, next) => {
    const productId = req.params.productId;
    await Product.findById(productId)
        .then(product => {
            res.render('admin/add-product', { 
                title: 'Edit Product',
                path: 'admin/edit-product',
                isEditing: true,
                product
            });
        })
        .catch(err => res.json(err.message));
};
// (5)
const edit_product_post = async (req, res, next) => {
    let { title, imageUrl, price, description, productId } = req.body;
    await Product.findById(productId)
        .then(product => {
            if(product.userId.toString() !== req.user._id.toString()) {
                console.log('can\'t edit this product, it\'s not yours !')
                return res.redirect('/products')
            }
            product.title = title;
            product.imageUrl = imageUrl;
            product.price = price;
            product.description = description
            return product
                    .save()
                    .then(result => {
                        console.log('product updated...')
                        res.redirect('/admin/products');
                    });
        })
        .catch(err => console.log(err));
};

// (6)
const delete_product_post = async (req, res, next) => {
    const productId = req.body.productId;
    await Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(() => {
            console.log('product deleted')
            res.redirect('/products')
        })
        .catch(err => console.log('can\'t delete this product') && console.log(err.message));
};

// Export admin controllers
module.exports = {
    products_get,
    add_Product_get,
    add_product_post,
    edit_product_get,
    edit_product_post,
    delete_product_post
};