// Error controller
module.exports.error_get = (req, res, next) => {
    res.status(404).render('errors/404', {
        title: 'Not Found',
        path: ''
    });
};
