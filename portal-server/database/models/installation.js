module.exports = (sequelize, Sequelize) => {
 
    const Installation = sequelize.define("Installation", {
        Uid: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        Version: {
            type: Sequelize.STRING
        },
        AppName: {
            type: Sequelize.STRING
        },
    },
        {
			freezeTableName: true,
            timestamps: false
        });

    return Installation;
};