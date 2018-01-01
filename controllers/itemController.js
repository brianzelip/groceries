exports.landingPage = (req, res) => {
  res.render('index');
};

exports.getItem = (req, res) => {
  res.send(`passed param: ${req.params.item}`);
};
