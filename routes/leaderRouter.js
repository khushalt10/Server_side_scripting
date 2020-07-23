const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router({mergeParams: true});

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send all the leaders to you!');
})
.post((req, res, next) => {
    res.end('Will add the leader: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
})
.delete((req, res, next) => {
    res.end('Deleting all leaders');
});

leaderRouter.route('/:leaderId')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req,res,next) => {
  res.end('Will send details of the leader: ' + req.params.leaderId + " to you!");
})
.post((req,res,next) => {
  res.statusCode = 403;
  res.end('Postt operation not supported on /leaders/'+ req.params.leaderId );
})
.put((req,res,next) => {
  res.write('Update the leader: ' + req.params.leaderId);
  res.end('Will be updating the leader: ' + req.body.name + " with details:  "+ req.body.description);
})
.delete((req,res,next) => {
  res.end('deleting the leader: '+ req.params.leaderId);
})

module.exports = leaderRouter;