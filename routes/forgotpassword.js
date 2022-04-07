const crypto=require('crypto')
const { User } = require("../models/user");
const router = require("express").Router();
require('dotenv').config()
const res = require("express/lib/response");
const nodemailer=require('nodemailer')

router.post('/',(req,res)=>
{

    if(req.body.email==='')
      {
        res.status(400).send('Email required')
      }
    console.error(req.body.email)
    const user =  User.findOne
    ({
        where:
        {
            email: req.body.email 
        } ,
    }).then((user)=>
   
    {
       if(user===null)
        {
          console.error('Email is not available in database')
           res.status(403).send('Email is not in DB')
        }
      else
        {
            const token=crypto.randomBytes(20).toString('hex')
            user.update
             ({
                resetPasswordToken:token,
                resetPasswordExpires:Date.now()+3600000,
              });

            const transporter=nodemailer.createTransport
            ({
               service:"gmail",
               auth:
                {
                 user:`${process.env.EMAIL_ADDRESS}`,
                 pass:`${process.env.EMAIL_PASSWORD},`
                },

             });

           const mailOptions=
             {
               from:'rvsreekanthkumar90@gmail.com',
               to:`${user.email}`,
               subject:"Link to reset password",
               text:
                 'You are receiving this email because you( or someone else) have requested the reset of the password for your account.\n\n'
                  +'Please click on the following link or paste this into your browser to complete the process within one hour of receiving it.\n\n'
                  +`http://localhost:8080/reset/${token} \n\n`
                  +'If you did not request this,please igonre this email.\n',

                };
                console.log('sending email to',user.email)

                transporter.sendMail(mailOptions,(err,response)=>
              {
                if(err)
                  {
                     console.error('There was an error',err)

                   }
                else{
                   console.log('here is the res',response)
                   res.status(200).json('recovery email sent')
                    }
                });
            }
        });
    })


module.exports = router;