module.exports = (sequelize, Sequelize) => {
    const Plugins = sequelize.define("Plugins", {
      Id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    Uid: {
        type: Sequelize.STRING,
        allowNull : false
    },
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    UniqueName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Version: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Description: {
        type: Sequelize.STRING
    },
    UiPort: {
        type: Sequelize.STRING,
        allowNull: false
    },
    BaseUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Instances: {
        type: Sequelize.STRING
    },
    ServerPort: {
        type: Sequelize.STRING,
        allowNull: false
    },
    PrependUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    IconUrl : {
        type: Sequelize.TEXT,
        allowNull: true
    },
    UiUrls: {
        type: Sequelize.TEXT
    },
    ServerUrls: {
        type: Sequelize.TEXT
    },
    IsRegistered: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    ServicesEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    IsLicenced: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    IsActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    CreatedDate: {
        type: Sequelize.DATE
    },
    LastModifiedDate: {
        type: Sequelize.DATE
    }
    },
    {
          timestamps: false
    });
  
    return Plugins;
  };