const forceText = (req, res, next) => { // Body is always text 
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.body = data;
        next();
    });
};

export default forceText;