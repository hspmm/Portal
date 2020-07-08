
module.exports =  function(sequelize, Sequelize) {
    const SessionLogs =  sequelize.define('SessionLogs', {
        sid: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: false
        },
          expires: {
            type: Sequelize.DATE,
            allowNull: false
        },
 /*          data: {
            type: Sequelize.TEXT,
            allowNull: false
        } */
    });
 
    return SessionLogs;
}