module.exports = (sequelize, DataTypes) => {
    const ProductDepartment = sequelize.define(
      'ProductDepartment',
      {
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        department_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        timestamps: false,
        tableName: 'product_department',
      }
    );
  
    ProductDepartment.associate = (models) => {
      models.ProductDepartment.belongsTo(models.Product, {
        as: 'product',
        foreignKey: 'product_id',
      });
      models.ProductDepartment.belongsTo(models.Department, {
        as: 'department',
        foreignKey: 'department_id',
      });
    };
  
    return ProductDepartment;
  };
  