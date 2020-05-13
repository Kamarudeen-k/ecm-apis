module.exports = (sequelize, DataTypes) => {
  const ProductAttribute = sequelize.define(
    'ProductAttribute',
    {
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attribute_value_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'product_attribute',
    }
  );

  ProductAttribute.associate = (models) => {
    models.ProductAttribute.belongsTo(models.Product, {
      foreignKey: 'product_id',
    });
    models.ProductAttribute.belongsTo(models.AttributeValue, {
      foreignKey: 'attribute_value_id',
    });
  };

  return ProductAttribute;
};
