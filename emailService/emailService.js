const nodemailer = require('nodemailer');
const config = require('../config')

let smtpTransport = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    auth: {
        user: 'sebastian@creativomedia.gmbh',
        pass: 'Creativomedia123!'
    }
});

let emailService = {
    sendVerificationMail : (recipient, link) => {
        try{
            let mailOptions = {
                to : recipient,
                subject : 'Bitte bestätigen Sie ihren E-Mail Account',
                html : "Hallo, <br> Bitte clicken Sie auf diesen Link um Ihre E-Mail Addresse zu bestätigen <br> <a href="  + link + ">verifizieren</a>"
            }
            smtpTransport.sendMail(mailOptions);
            console.log("sent email!")
        }catch(ex){
            console.log(ex.message)
        }
    },

    sendResetPasswordMail : (recipient, link) => {
        try{
            let mailOptions = {
                to : recipient,
                subject : 'Passwortänderung',
                html : "Hallo, <br> Bitte clicken Sie auf diesen Link um ihr Passwort zurückzusetzen <br> <a href="  + link + ">Passwort zurücksetzen</a>"
            }
            smtpTransport.sendMail(mailOptions);
        }catch(ex){
            console.log(ex.message)
        }
    }
}

module.exports = emailService;