module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_refrence_id: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      payment_gateway: {
        type: DataTypes.STRING(100)
      },
      paid_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      comments: DataTypes.STRING(255)
    },
    {
      timestamps: false,
      tableName: 'payment',
    }
  );
  
  Payment.associate = (models) => {
    models.Payment.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
    });
    models.Payment.belongsTo(models.Order, {
      foreignKey: 'order_id',
    });
    
  };
  return Payment;
};
