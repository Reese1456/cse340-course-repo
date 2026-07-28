const emptyFlashMessages = () => ({
  success: [],
  error: [],
  warning: [],
  info: [],
});

/**
 * Adds req.flash(type, message) for storing one-time messages and exposes the
 * same function to every EJS view through res.locals.flash.
 */
const flash = (req, res, next) => {
  req.flash = (type, message) => {
    if (!req.session.flash) {
      req.session.flash = emptyFlashMessages();
    }

    if (type && message) {
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }

      req.session.flash[type].push(message);
      return undefined;
    }

    if (type) {
      const messages = req.session.flash[type] || [];
      req.session.flash[type] = [];
      return messages;
    }

    const messages = req.session.flash;
    req.session.flash = emptyFlashMessages();
    return messages;
  };

  res.locals.flash = req.flash;
  next();
};

export default flash;
