const db = require(".");
db.sequelize.sync({force:true}).then(() => {
     db.sequelize.close();
  });