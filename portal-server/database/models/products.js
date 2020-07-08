module.exports = (sequelize, Sequelize) => {
	const Products = sequelize.define("Products", {
	  Id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
			  primaryKey: true
	  },
	  ProductUid: {
		type: Sequelize.STRING
	  },
	  ProductName: {
		type: Sequelize.STRING
	  },
	  Version: {
		type: Sequelize.STRING
	  },
	 Description: {
		type: Sequelize.STRING

     },
	 FeatureList:{
		type: Sequelize.STRING('MAX')
	 },
	 DateCreated:{
		type:Sequelize.STRING
	 },
	 DateUpdated:{
		type:Sequelize.STRING
	 }	
  
	},
	{
		  timestamps: false
	});
  
	return Products;
};