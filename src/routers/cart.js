const express = require('express');
const Cart = require('../models/cart');
const Item = require('../models/item');
const Auth = require('../middleware/auth');

const router = new express.Router();

// Get cart
router.get('/carts', Auth, async (req, res) => {
    try {
        const owner = req.user._id;
        const cart = await Cart.findOne({ owner });
        if (cart && cart.items.length) {
            res.status(200).send(cart);
        }
        else {
            res.status(204).send(null);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
});

// Add cart
router.post('/carts', Auth, async (req, res) => {
    try {
        const owner = req.user._id;
        const { itemId, quantity } = req.body;

        const cart = await Cart.findOne({ owner });
        const item = await Item.findOne({ _id: itemId });
        if (!item) {
            res.status(404).send({ message: "item not found" });
            return;
        }
        const { name, price } = item;

        //If cart already exist for the current user
        if (cart) {
            const itemIndex = cart.items.findIndex(item => {
                item.itemId === itemId
            });

            //check if product exists or not
            if (itemIndex > -1) {
                let product = cart.items[itemIndex];
                product.quantity += quantity;
                cart.bill = Cart.billCalculation();
                cart.items[itemIndex] = product;
                await cart.save();
                res.status(200).send(cart);
            }
            else {
                let newProduct = { itemId, quantity, name, price };
                cart.items.push(newProduct);
                cart.bill = Cart.billCalculation();
                await cart.save();
                res.status(200).send(cart);
            }
        }
        else {
            //no cart exists, create one
            const newCart = new Cart({
                owner,
                items: [{ itemId, quantity, name, price }],
                bill: quantity * price
            });
            return res.status(201).send(newCart);
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
});

//Delete an item from the cart
router.delete('/carts/', Auth, async (req, res) => {
    try {
        const owner = req.user._id;
        const itemId = req.query.itemId;

        const cart = await Cart.findOne({ owner });

        const itemIndex = cart.items.findIndex(item => item.itemId === itemId);
        if (itemIndex > -1) {
            let item = cart.items[itemIndex];
            cart.bill -= item.quantity * item.price;
            if (cart.bill < 0) {
                cart.bill = 0;
            }
            cart.items.splice(itemIndex, 1);
            cart.bill = Cart.billCalculation();
            cart = await cart.save();

            res.status(200).send(cart);
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
});
