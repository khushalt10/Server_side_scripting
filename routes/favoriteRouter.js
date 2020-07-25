const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favorite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({"user": req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favourites);


        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                if(favourites !== null)

                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user)
                    user = new Favourites({user: req.user.id});
                for(let i of req.body){
                    if(user.dishes.find((d_id) => {
                        if(d_id._id){
                            return d_id._id.toString() === i._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(i._id);
                }
                user.save()
                    .then((userFavs) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({"user": req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {

            if (favourites) {
                favourites.remove()
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));
                            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({"user": req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {

                if(!favourites){
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'Application/json');
                            return res.json({"exists": false, "favorites": favorites});
                        } else {
                            if(favourites.dishes.indexOf(req.params.dishId) < 0){
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'Application/json');
                                return res.json({"exists": false, "favorites": favourites});
                            } else {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'Application/json');
                                return res.json({"exists": true, "favorites": favourites});
                            }
                        }
                    }, (err) => next(err))
                    .catch((err) => next(err))
                })

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ "user": req.user._id })
    .then((favorites) => {
        if(favorites !== null){


            Favourites.create({ user: req.user._id, dishes: [ req.params.dishId ] })
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    console.log('Favorites Created', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }, (err) => next(err))
                .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{

            var dishParams = favorites.dishes.filter((dish) => dish.equals(req.params.dishId));
            if(dishParams.length > 0){
                 err = new Error('Dish ' + req.params.dishId + ' already in your favorites!');
                 err.status = 400;
                 return next(err);
            } else {
             Favourites.dishes.push(req.params.dishId);
             Favourites.save()
             .then((favorites) => {
                 Favourites.findById(favorites._id)
                     .populate('user')
                     .populate('dishes')
                     .then((favorites) => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json(favorites);
                     })
             }, (err) => next(err))
             .catch((err) => next(err));
            }
        }


        }, (err) => next(err))
    .catch((err) => next(err));
})






.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({"user": req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            if(favourites)

                 var dishespresent = favourites.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
                 if(dishespresent)
                 {
                    var err = new Error('You do not have any favourites');
                    err.status = 404;
                    return next(err);
                 }
                 else{
                    favourites.findByIdAndRemove(req.params.dishId)
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));
                 }

        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favouriteRouter;
