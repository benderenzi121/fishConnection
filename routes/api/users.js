const express = require('express');
const router = express.Router();
//router.(get/post) takes 3 params ( 'route to api', [validation checks] , callback )
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const {check, validationResult} = require('express-validator');
//  check is a function used for validation. it takes 2 params
//  ( 'Name of field to be checked' , 'error message if check fails' )

//  validation result stores the array of results from the validation check.
//  will return an array of failed checks as well as associated error message
const User = require('../../models/User')



// @route           POST api/users
// @description     Register user
// @access          Public
router.post('/', [
    check('name','name is required')
        .not()
        .isEmpty(),
    check('email', 'please include a valid email')
        .isEmail(),
    check('password', 'please enter a password with 6 or more charecters' )
        .isLength({min: 6})

],
async (req,res) => { 
    const  errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const{name, email, password} = req.body;

    try{
        
        let user = await User.findOne({ email })

        if (user){
            res.status(400).json({errors: [{msg: 'user already exists' }] });
        }
    
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar, 
            password
        });
        
       
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt)

    //  saves user to the database
        await user.save();

    //  This starts the JSON web token part
        
    //  creates a payload to be loaded into the token
        const payload = {
            user: {
                id: user.id
            }
        }

    //  signs the json token using payload, secret key in config.js,
    //  timer for when the token will expire, callback function to either
    //  throw error or return the token in a json format
       
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
            )
   
        

    } catch(err){
        console.error(err);
        res.status(500).send('server error');
    }
    
});

module.exports = router;