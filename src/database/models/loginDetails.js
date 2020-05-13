module.exports = (sequelize, DataTypes) => {
    const LoginDetails = sequelize.define(
      'LoginDetails',
      {
        serial_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        last_logout: {
          type: DataTypes.DATE,
          allowNull: true
        },
        access_token: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        token_expires_in: {
          type: DataTypes.DATE,
          allowNull: false
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: true
        },
      },
      {
        timestamps: false,
        tableName: 'login_details',
      }
    );
  
    LoginDetails.associate = (models) => {
      models.LoginDetails.belongsTo(models.Customer, {
        foreignKey: 'customer_id'
      });
  
    };
  
    return LoginDetails;
  };
  