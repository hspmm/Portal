module.exports = (sequelize, Sequelize) => {
    const RegisteredApplications = sequelize.define("RegisteredApplications", {
      ApplicationId: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate : {
            notEmpty : true
        }            
    },
    ApplicationName: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate : {
            notEmpty : true
        }  
    },
    ApplicationVersion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate : {
            notEmpty : true
        }  
    },
    ApplicationGuid: {
      type: Sequelize.STRING,
      allowNull: false,
      validate : {
          notEmpty : true
      }  
    },
    ApplicationSecret: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate : {
            notEmpty : true
        }  
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
  
    return RegisteredApplications;
  };