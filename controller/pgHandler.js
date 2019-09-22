const PG = require('../model/pgModel');
const User = require('../model/userModel');
const jwt = require('jsonwebtoken');


exports.verifyToken = (req,res,next) => {
    if(!req.headers.authorization){
        return res.status(401).send('unauthorized request');
    }

    let token = req.headers.authorization.split(' ')[1]
    if(token === 'null') {
        return res.status(401).send('unauthorized request');
    }
    let payload = jwt.verify(token, 'kat')
    if(!payload) {
        res.status(401).send('unauthorized request');
    }
    res.userid = payload.subject
    next()

};


exports.pglistAction  = (req,res) => {
    
    PG.find( (err, result) => {
        if(err) {
            res.status(400).send({errorMsg: 'Error Occurred while retriving PG list !'})
        } else {
            res.status(200).json({pglist : result});
        }
    })
}

exports.addPgAction = (req,res) => {
    
    const { name, email, mobile, city, location, availableFor, occupancy,
            bathroom, balcony, parking,furnishDetails, rent } =  req.body;

    User.findOne({email})
    .then(user=>{
        if(!user) {
            res.status(404).json({'emailError': 'Please enter registered Email'});
        } else {
            const userId = user.id;
            console.log(userId);

            const newPg = new PG ({
                    name, email, mobile, city, location, availableFor, occupancy,
                    bathroom, balcony, parking,furnishDetails, rent, userId});
            newPg.save()
            .then(item => {
                res.status(200).send({msg: 'New PG added Successfully'});
            })
            .catch(err => {
                console.log(err);
                res.status(400).send({msg: 'Unable to save to Database'});
            })
        }
    });
};

// view pg

exports.viewPg = (req,res) => {
    console.log(req.params.pgId);
    PG.findById(req.params.pgId, function(err, result) {
        if(err) {
            console.log(err);
            if(err.kind === 'ObjectId') {
                return res.status(404).send({message: "page not found with id " + req.params.pgId});                
            }
            return res.status(500).send({message: "Error finding page with id " + req.params.pgId});
        }

        if(!result) {
            return res.status(404).send({message: "page not found with id " + req.params.pgId});            
        }else{
            res.send({'pg': result});
        }
    });
};