module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    'ProductCategory',
    {
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'product_category',
    }
  );

  ProductCategory.associate = (models) => {
    models.ProductCategory.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'product_id',
    });
    models.ProductCategory.belongsTo(models.Category, {
      as: 'category',
      foreignKey: 'category_id',
    });
  };

  return ProductCategory;
};
