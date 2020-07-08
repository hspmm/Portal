module.exports =  function(sequelize, Sequelize) {
    const Sessions = sequelize.define('Sessions', {
        sid: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          userName: Sequelize.STRING,
          accessToken: Sequelize.TEXT,
          refreshToken: Sequelize.TEXT,
          privileges: Sequelize.TEXT,
          tokenTimeOutInterval: Sequelize.TEXT,
          tokenRefreshedAt : Sequelize.DATE,
          expires: Sequelize.DATE,
          data: Sequelize.TEXT
    });
 
    return Sessions;
}