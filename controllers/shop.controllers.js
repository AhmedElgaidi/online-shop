// Import our Product model
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// Naming convention by MDN
// (1) index_get
// (2) products_get
// (3) product_get
// (4) cart_get
// (5) cart_post
// (6) deleteproduct_post
// (7) orders_get
// (8) checkout_get

//====================================================
// Shop controllers
// (1)
const index_get = (req, res, next) => {
    // I'll write here what techs i used in this project
    res.render('shop/index', { 
        title: 'Home page',
        path: '/'   
    });
};

// (2)
const products_get = async (req, res, next) => {
    let errorMessage = req.flash('error'); // flash gives an array of messages
    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        // so it doesn't display any div
        errorMessage = null;
    }
    // (2)
    let successMessage = req.flash('success');
    if(successMessage.length > 0) {
        successMessage = successMessage[0];
    } else {
        successMessage = null;
    }
    await Product
            .find()
            .sort({ createdAt: -1 })// Sort them descendingly
            .then(products => {
                res.render('shop/products', { 
                    title: 'Available products',
                    path: '/products',
                    prods: products,
                    errorMessage,
                    successMessage
                })
            })
            .catch(err => res.json(err.message));
};

// (3)
const product_get = async (req, res, next) => {
    const productId = req.params.productId;
    await Product.findById(productId)
        .then(product => {
            res.render('shop/product-details', { 
                title: 'Edit Product',
                path: '/products',
                isEditing: true,
                product
            });
        })
        .catch(err => res.json(err.message));
};

// (4)
const cart_get = async (req, res, next) => {
    let products = await Cart
    .find()
    .sort({ createdAt: -1 })// Sort them descendingly
    .then(products => {
        res.render('shop/cart', { 
            title: 'Your Cart',
            path: '/cart',
            products: products
        })
    })
    .catch(err => res.json(err.message));
};

// (5)
const cart_post = async (req, res, next) => {
    let productId = req.body.productId,
        userId = '5fc10441570bd5d4bcabb2ab';// logged in user
        // //test
        let productPrice = await Product.findById(productId)
            .then(product => product.price);

    try{
        let cart = await Cart.findOne({ userId });
        if (cart) {
            // Cart exists for a user
            let itemIndex = cart.products.findIndex(p => p.productId == productId);
            if(itemIndex > -1) {
                // It means the product exists in the cart, so just update the quantity
                cart.products[itemIndex].quantity +=1;
                cart.products[itemIndex].price = productPrice * cart.products[itemIndex].quantity;
            }else {
                // The product doesn't exist there
                cart.products.push({ productId, price: productPrice, quantity: 1 });
            }
            // now Save the cart
            cart = await cart.save();
            res.json(cart);
        }else {
            // User has no cart yet
            const newCart = await Cart.create({
                userId,
                products: [{
                    productId: productId,
                    price: productPrice,
                    quantity: 1
                }],
                totalPrice: productPrice
            })
            .then(cart => res.json(cart))
        }
    }catch {
        res.json('something wrong...')
    }
};

// (6)
const deleteproduct_post = async (req, res, next) => {
    let productId = req.body.productId;
    console.log('delete item request...')
    // let cartProducts = await Cart.find()
    //     .then(products => {
    //         // To get it's price
    //         let product = Product.findById(productId);
    //         updatedProducts = products.map(el => {
    //             if(el.productId == productId) {
    //                 el.price -= product.price;
    //                 el.quantity -= product.quantity;
    //             }
    //         });
    //         products = updatedProducts;
    //         return products;
    //     })
    //     .then(products => products.save())
    //     .then(() => console.log('item deleted'))
    //     // .catch(err => console.log(err.message))
    //     // next();
};

// (7)
const orders_get = (req, res, next) => {
    console.log(req.session.user, '===============\n')
    res.render('shop/order', {
        title: 'Orders',
        path: '/order'
    })  
};

// (8)
const checkout_get = (req, res, next) => {

};


//====================================================
// Export my controllers
module.exports = {
    index_get,
    products_get,
    product_get,
    cart_get,
    cart_post,
    deleteproduct_post,
    orders_get,
    checkout_get
};