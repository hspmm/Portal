module.exports = (sequelize, Sequelize) => {
    const Nodes = sequelize.define("Nodes", {
      Uid: {
              type: Sequelize.STRING,
              primaryKey: true
      },
      NodeID: {
        type: Sequelize.INTEGER
      },
      NodeName: {
        type: Sequelize.STRING
      },
      NodeShortName: {
        type: Sequelize.STRING
      },
      ParentID: {
        type: Sequelize.INTEGER
      },
      RootID: {
        type: Sequelize.STRING
      },
      NodeType: {
        type: Sequelize.STRING
      },
      TypeOf: {
        type: Sequelize.STRING
      },
      NodeInfo: {
        type: Sequelize.STRING(4000)
      },
      CreatedDate: {
        type: Sequelize.DATE
      },
      LastModifiedDate: {
        type: Sequelize.DATE
      },
      TypeName:{
        type:Sequelize.STRING
      },
      IconUrl:{
        type: Sequelize.TEXT      }
      },
      {
          timestamps: false
      });
  
    return Nodes;
  };