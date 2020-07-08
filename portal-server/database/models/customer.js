module.exports = (sequelize, Sequelize) => {
	const Customer = sequelize.define("Customer", {
	  CustomerID: {
			  type: Sequelize.STRING
			
	  },
	  NodeID:{
		  type: Sequelize.INTEGER,
		  autoIncrement: true,
		  primaryKey:true
	  },
	  NodeName: {
		  type: Sequelize.STRING
		},
		EmailID: {
		  type: Sequelize.STRING
		},
		Telephone: {
		  type: Sequelize.STRING
		},
		DomainName: {
		  type: Sequelize.STRING
		},
		CertificatePath:{
			type: Sequelize.STRING
		},
		CertificateValidity:{
			type:Sequelize.STRING
		},
		isCA:{
			type:Sequelize.STRING
		},
		CertificateName:{
			type:Sequelize.STRING
		}
  
		
  
			  },
	  {
		  timestamps: false
	  });
  
	return Customer;
  };