module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: DataTypes.STRING(1000),
    },
    {
      timestamps: false,
      tableName: 'category',
    }
  );

  Category.associate = (models) => {
    models.Category.belongsTo(models.Department, {
      foreignKey: 'department_id',
      onDelete: 'CASCADE',
    });

    models.Category.belongsToMany(models.Product, {
      through: 'ProductCategory',
      foreignKey: 'category_id',
    });
  };

  return Category;
};
