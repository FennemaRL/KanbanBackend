const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENTID, // ClientID
  process.env.CLIENTSECRET, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESHTOKEN,
});

router.post("/", async (req, res) => {
  let {name, mail, message} = req.body;
  

  const accessToken =  await oauth2Client.getAccessToken()
  
  const transporter  =  nodemailer.createTransport({
    service:'gmail',
    auth:{
      type: "OAuth2",
      user: process.env.USERMAIL,
      clientId:  process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.REFRESHTOKEN,
      accessToken: accessToken
    }
  })

  let resmail = await transporter.sendMail({
    from: process.env.USERMAIL,
    to: process.env.MAILTO, 
    subject: "My site contact "+ name +" respond to: "+ mail, 
    text:"from: "+name+" replay to: "+mail +" message: "+ message,
  })
  if (resmail.response.split(' ')[2] === 'OK' ){
      res.status(200).json({message:"se envio con exito"})
  }
  else{
      res.status(400).json({message:"lo sentimos no se pudo enviar el mail devido a un error en el servicio"})
  }
})

module.exports = router; 