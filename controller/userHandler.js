const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

exports.registerAction = (req,res) => {

    const { userName, email, password, confirmPassword } = req.body;
    const temptoken = jwt.sign({userName, email}, 'kat', { expiresIn: '12h' });

    User.findOne({email:email})
    .then(user => {
        if(user) {
            res.status(401).json({error: 'email already exists'})
        } else {
            const newUser = new User ({
                userName,
                email,
                password,
                temptoken

            });
            bcrypt.genSalt(10, (err,salt)=>{
                bcrypt.hash(newUser.password, salt, (err,hash)=>{
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user =>{
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY='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');
                        const mssg = {
                            to: user.email,
                            from: 'ajaialex006@gmail.com',
                            subject: 'Sending with Twilio SendGrid is Fun',
                            text:'Hello'+user.userName+',please click the link to verify http://localhost:3000/activate/'+user.temptoken,
                            html: 'Hello <strong>'+user.userName+
                            '</strong>,<br><br>please click the link to verify<br><br><a href="http://localhost:3000/activate/'
                            +user.temptoken+'">click here</a>',
                        };
                        sgMail.send(mssg);
                        console.log(mssg);
                        res.status(200).json({message: 'Registeration Successfull'})
                    })
                    .catch(err => {
                        res.status(500).json({SGerror:'Internal server error'})
                    })
                })
            })
        };
        
    })
    .catch(err =>{
        res.status(500).json({internalError:'internal server error'})
    });
};

exports.loginAction = (req,res) => {
    const { email, password } = req.body;

    User.findOne({email})
    .then(user=>{
        if(!user) {
            res.status(404).json({error: 'Email not registered'})
        }else{
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(!isMatch) {
                res.status(401).json({passwordError: 'Password not matching'})  
            } else if(!user.temptoken) {
                return res.status(404).json({linkError :'link expired'});
             } else if(!user.active){
                return  res.status(401).json({activationError: ' Email not verified. please verify it'});
             } else {
                 let payload = { subject: user.id };
                 console.log(user.id);
                 let token = jwt.sign(payload,'kat', {expiresIn: '3h'});
                 res.status(200).send({'token':token,
                                        'user': {
                                            'userId': user.id,
                                             'name': user.userName,
                                             'email': user.email
                                        }});
            }
        })
        }
    })
};

exports.activateAction = (req,res) => {
    User.findOne({temptoken: req.params.token}, (err, user) => {
        if(err) throw err;
        var token = req.params.token;

        jwt.verify(token, 'kat', (err, decoded) => {
            if(err) {
                res.status(404).json({ message: 'link expired'})
            } else if (!user) {
                res.status(404).json({ message: 'Invalid Link' })
            } else {
                user.temptoken = false;
                user.active = true;
                user.save()
                    .then(user =>{
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY='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');
                        const mssg = {
                            to: user.email,
                            from: 'ajaialex006@gmail.com',
                            subject: 'Email Verification',
                            text:'Hello'+user.userName+ 'Account activated',
                            html: 'Hello <strong>'+user.userName+'</strong>, Account activated',
                        };
                        sgMail.send(mssg);
                        res.status(200).json({message: 'Account activated ! Please login..'})
                    
                    })
                    .catch ( err =>{
                        console.log(err);
                    })
            }
        })
    })
};


exports.resendAction = (req,res) => {
    const { email, password } = req.body;

    User.findOne({email})
    .then(user =>{
        if(!user) {
            res.status(404).json({error: 'Email not registered'})
        } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;

                if(!isMatch){
                    res.status(401).json({passwordError: 'Password not matched'})
                } else if(user.active) {
                    return res.status(401).json({activationError: 'Email Already verified. please Login'})
                } else {
                    const userName = user.userName;
                    const token = {temptoken:user.temptoken};
                    const newtoken = {temptoken:jwt.sign({email},'kat',{expiresIn: '12h'})};
                    const newtemp = jwt.sign({email},'kat',{expiresIn:'12h'});
                    const options = {upsert:false}
                    User.updateOne(token,{$set: newtoken},options,(err,token)=>{
                        if(err) throw err;
                    })
                    .then(user=>{
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY='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');
                    const mssg = {
                        to:email,
                        from: 'ajaialex006@gmail.com',
                        subject: 'Email Verification',
                        text:'Hello'+userName+',please click the link to verify http://localhost:3000/activate/'+user.temptoken,
                        html: 'Hello <strong>'+userName+
                        '</strong>,<br><br>please click the link to verify<br><br><a href="http://localhost:3000/activate/'
                        +newtemp+'">click here</a>',
                    };
                    sgMail.send(mssg);
                    res.status(200).json({resendMail: 'Verification Email sccessfull sent. Please Verify!'})
                    })
                    .catch(err=>{
                        console.log(err);
                    })
               
                
            }
        })
    }
  })

}


