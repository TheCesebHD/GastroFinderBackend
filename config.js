const config = {
    webserver: {
        port: 3000
    },
    jwt: {
        secret: 'much_secret_many_dsgvokonform_such_authentication'
    },
    email: {
        host: 'smtp.office365.com',
        port: 587,
        auth: {
            user: 'sebastian@creativomedia.gmbh',
            pass: 'Creativomedia123!'
        }
    }
}

module.exports = config