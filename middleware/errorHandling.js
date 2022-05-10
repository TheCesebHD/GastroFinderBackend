module.exports = (err, req, res, next) => {
    console.log('error: ' +  err)
    return res.status(500).send(err)
}