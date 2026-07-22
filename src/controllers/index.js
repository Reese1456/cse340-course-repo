/**
 * Controller for the home page.
 */
const showHomePage = (req, res) => {
  res.render('home', { title: 'CSE 340 Service Network' });
};

export { showHomePage };
