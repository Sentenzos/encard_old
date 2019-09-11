let checkAuth = require('../middleware/checkAuth');
let tableNoAuth = require('../middleware/tableNoAuth');
let cardsNoAuth = require('../middleware/cardsNoAuth');

module.exports = function(app) {
  app.get('/', require('./home').get);
  app.get('/logout', require('./home').logout);
  app.get('/verify', require('./home').verify);
  app.get('/newpass', require('./home').reqNewPass);
  app.post('/login', require('./home').login);
  app.post('/registration', require('./home').registration);
  app.put('/resetPassSendMail', require('./home').resetPassSendMail);
  app.put('/setNewPass', require('./home').setNewPass);
  

  app.get('/cards', cardsNoAuth, require('./cards').get);
  app.get('/getBasesNames', checkAuth, require('./cards').getBasesNames);
  app.get('/getBase', checkAuth, require('./cards').getBase);
  app.put('/queryAnotherBase', checkAuth, require('./cards').queryAnotherBase);
  app.put('/learnedTransfer', checkAuth, require('./cards').learnedTransfer);
  app.put('/repeatTransfer', checkAuth, require('./cards').repeatTransfer);
  app.post('/timerInfo', checkAuth, require('./cards').timerInfo);
  app.get('/resetTimerInfo', checkAuth, require('./cards').resetTimerInfo);
  app.get('/tutorial', checkAuth, require('./cards').tutorial);

  app.get('/tables', tableNoAuth, require('./tables').get);
  app.get('/getInitBaseForTable', checkAuth, require('./tables').getInitBaseForTable);
  app.get('/getAllBasesNames', checkAuth, require('./tables').getAllBasesNames);
  app.get('/getEngWord/:base/:word', checkAuth, require('./tables').getEngWord);
  app.get('/getRusWord/:base/:word', checkAuth,require('./tables').getRusWord);
  app.put('/getDirectBase', checkAuth, require('./tables').getDirectBase);
  app.post('/newBaseName', checkAuth, require('./tables').newBaseName);
  app.put('/renameBase', checkAuth, require('./tables').renameBase);
  app.put('/addNewWord', checkAuth, require('./tables').addNewWord);
  app.put('/addNewWordAccept', checkAuth, require('./tables').addNewWordAccept);
  app.put('/changeEngWord', checkAuth, require('./tables').changeEngWord);
  app.put('/changeRusWord', checkAuth, require('./tables').changeRusWord);
  app.put('/transferWordsFromBase', checkAuth, require('./tables').transferWordsFromBase);
  app.delete('/deleteBase', checkAuth, require('./tables').deleteBase);
  app.delete('/deleteWordsFromBase', checkAuth, require('./tables').deleteWordsFromBase);
};